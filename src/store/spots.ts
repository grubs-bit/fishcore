import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export type SpotType = "beach" | "jetty" | "rocks" | "estuary";

export type Spot = {
  id: string;
  name: string;
  notes: string;
  type: SpotType;
  lat?: number;
  lng?: number;
};

const STORAGE_KEY = "fishcore_spots";

let spotsData: Spot[] = [];
let initialized = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

async function saveSpots() {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(spotsData));
}

function normalizeSpot(raw: any): Spot {
  return {
    id: String(raw.id),
    name: raw.name ?? "",
    notes: raw.notes ?? "",
    type: raw.type ?? "jetty",
    lat: typeof raw.lat === "number" ? raw.lat : undefined,
    lng: typeof raw.lng === "number" ? raw.lng : undefined,
  };
}

async function loadSpots() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (raw) {
      const parsed = JSON.parse(raw);
      spotsData = Array.isArray(parsed) ? parsed.map(normalizeSpot) : [];
    } else {
      spotsData = [
        {
          id: "1",
          name: "Chapora Jetty",
          notes: "Try around tide change.",
          type: "jetty",
        },
        {
          id: "2",
          name: "Miramar",
          notes: "Wind matters a lot.",
          type: "beach",
        },
      ];
      await saveSpots();
    }
  } catch {
    spotsData = [
      {
        id: "1",
        name: "Chapora Jetty",
        notes: "Try around tide change.",
        type: "jetty",
      },
      {
        id: "2",
        name: "Miramar",
        notes: "Wind matters a lot.",
        type: "beach",
      },
    ];
  }

  initialized = true;
  notify();
}

export function useSpots() {
  const [spots, setSpots] = useState<Spot[]>(spotsData);
  const [isLoading, setIsLoading] = useState(!initialized);

  useEffect(() => {
    const listener = () => {
      setSpots([...spotsData]);
      setIsLoading(false);
    };

    listeners.add(listener);

    if (!initialized) {
      loadSpots();
    } else {
      setSpots([...spotsData]);
      setIsLoading(false);
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { spots, isLoading };
}

export async function addSpot(spot: Omit<Spot, "id">) {
  spotsData = [
    {
      id: Date.now().toString(),
      ...spot,
    },
    ...spotsData,
  ];

  notify();
  await saveSpots();
}

export async function updateSpot(id: string, updates: Omit<Spot, "id">) {
  spotsData = spotsData.map((spot) =>
    spot.id === id
      ? {
          ...spot,
          ...updates,
        }
      : spot,
  );

  notify();
  await saveSpots();
}

export async function deleteSpot(id: string) {
  spotsData = spotsData.filter((spot) => spot.id !== id);

  notify();
  await saveSpots();
}
