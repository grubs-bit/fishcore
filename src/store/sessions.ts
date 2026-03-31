import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export type Session = {
  id: string;
  spotId: string;
  bait: string;
  species: string;
  count: number;
  notes: string;
  createdAt: string;

  moonPhase?: string;
  tideState?: string;
  tideLevel?: number | null;
  waveHeight?: number | null;
  windSpeed?: number | null;
  pressure?: number | null;
  temperature?: number | null;
};

export type SessionInsights = {
  totalCatches: number;
  totalSessions: number;
  bestBait: string | null;
  topSpecies: string | null;
  bestTideState: string | null;
  bestMoonPhase: string | null;
  bestWindBucket: string | null;
};

const STORAGE_KEY = "fishcore_sessions";

let sessionsData: Session[] = [];
let initialized = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

async function saveSessions() {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsData));
}

function normalizeSession(raw: any): Session {
  return {
    id: String(raw.id),
    spotId: String(raw.spotId),
    bait: raw.bait ?? "",
    species: raw.species ?? "",
    count: typeof raw.count === "number" ? raw.count : Number(raw.count ?? 0),
    notes: raw.notes ?? "",
    createdAt: raw.createdAt ?? new Date().toISOString(),
    moonPhase: raw.moonPhase ?? undefined,
    tideState: raw.tideState ?? undefined,
    tideLevel:
      typeof raw.tideLevel === "number"
        ? raw.tideLevel
        : (raw.tideLevel ?? null),
    waveHeight:
      typeof raw.waveHeight === "number"
        ? raw.waveHeight
        : (raw.waveHeight ?? null),
    windSpeed:
      typeof raw.windSpeed === "number"
        ? raw.windSpeed
        : (raw.windSpeed ?? null),
    pressure:
      typeof raw.pressure === "number" ? raw.pressure : (raw.pressure ?? null),
    temperature:
      typeof raw.temperature === "number"
        ? raw.temperature
        : (raw.temperature ?? null),
  };
}

async function loadSessions() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (raw) {
      const parsed = JSON.parse(raw);
      sessionsData = Array.isArray(parsed) ? parsed.map(normalizeSession) : [];
    } else {
      sessionsData = [];
      await saveSessions();
    }
  } catch {
    sessionsData = [];
  }

  initialized = true;
  notify();
}

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>(sessionsData);
  const [isLoading, setIsLoading] = useState(!initialized);

  useEffect(() => {
    const listener = () => {
      setSessions([...sessionsData]);
      setIsLoading(false);
    };

    listeners.add(listener);

    if (!initialized) {
      loadSessions();
    } else {
      setSessions([...sessionsData]);
      setIsLoading(false);
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { sessions, isLoading };
}

export async function addSession(session: Omit<Session, "id" | "createdAt">) {
  sessionsData = [
    {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...session,
    },
    ...sessionsData,
  ];

  notify();
  await saveSessions();
}

export async function deleteSessionsForSpot(spotId: string) {
  sessionsData = sessionsData.filter((session) => session.spotId !== spotId);

  notify();
  await saveSessions();
}

export function formatSessionTime(value: string) {
  const date = new Date(value);

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getTopKey(map: Record<string, number>) {
  let bestKey: string | null = null;
  let bestValue = -1;

  for (const key in map) {
    if (map[key] > bestValue) {
      bestValue = map[key];
      bestKey = key;
    }
  }

  return bestKey;
}

function getWindBucket(windSpeed: number | null | undefined) {
  if (windSpeed == null) return null;
  if (windSpeed <= 12) return "Light wind";
  if (windSpeed <= 20) return "Moderate wind";
  if (windSpeed <= 28) return "Rough wind";
  return "Heavy wind";
}

export function getSessionInsights(sessions: Session[]): SessionInsights {
  const baitMap: Record<string, number> = {};
  const speciesMap: Record<string, number> = {};
  const tideMap: Record<string, number> = {};
  const moonMap: Record<string, number> = {};
  const windMap: Record<string, number> = {};

  let totalCatches = 0;

  for (const session of sessions) {
    totalCatches += session.count;

    if (session.bait?.trim()) {
      baitMap[session.bait] = (baitMap[session.bait] || 0) + session.count;
    }

    if (session.species?.trim()) {
      speciesMap[session.species] =
        (speciesMap[session.species] || 0) + session.count;
    }

    if (session.tideState?.trim()) {
      tideMap[session.tideState] =
        (tideMap[session.tideState] || 0) + session.count;
    }

    if (session.moonPhase?.trim()) {
      moonMap[session.moonPhase] =
        (moonMap[session.moonPhase] || 0) + session.count;
    }

    const windBucket = getWindBucket(session.windSpeed);
    if (windBucket) {
      windMap[windBucket] = (windMap[windBucket] || 0) + session.count;
    }
  }

  return {
    totalCatches,
    totalSessions: sessions.length,
    bestBait: getTopKey(baitMap),
    topSpecies: getTopKey(speciesMap),
    bestTideState: getTopKey(tideMap),
    bestMoonPhase: getTopKey(moonMap),
    bestWindBucket: getTopKey(windMap),
  };
}
