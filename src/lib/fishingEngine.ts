import type { SpotType } from "../store/spots";
import { getMoonPhase } from "./moon";
import type { TideSummary } from "./tides";
import type { WeatherData } from "./weather";

export type FishingInsight = {
  score: number;
  rating: "Poor" | "Fair" | "Good";
  moonPhase: string;
  reasons: string[];
};

function hoursUntil(target: string | null) {
  if (!target) return null;

  const now = new Date().getTime();
  const then = new Date(target).getTime();

  if (Number.isNaN(then)) return null;

  return (then - now) / (1000 * 60 * 60);
}

function getTimeOfDayScore() {
  const now = new Date();
  const hour = now.getHours();

  if ((hour >= 5 && hour <= 8) || (hour >= 17 && hour <= 19)) {
    return {
      points: 15,
      reason: "Prime shore window around dawn/dusk.",
    };
  }

  if ((hour >= 8 && hour <= 10) || (hour >= 15 && hour <= 17)) {
    return {
      points: 8,
      reason: "Decent time window.",
    };
  }

  return {
    points: 3,
    reason: "Midday/off-peak timing is less favorable from shore.",
  };
}

function getTypeAdjustedTideScore(spotType: SpotType, nearest: number | null) {
  if (nearest === null) {
    return {
      points: 0,
      reason: "No tide timing available.",
    };
  }

  if (spotType === "jetty" || spotType === "estuary") {
    if (nearest <= 2) {
      return {
        points: 45,
        reason: "Near tide change — excellent for jetty/estuary movement.",
      };
    }
    if (nearest <= 4) {
      return {
        points: 28,
        reason: "Tide movement is building for this type of spot.",
      };
    }
    return {
      points: 8,
      reason: "Far from tide turn for a tide-sensitive spot.",
    };
  }

  if (spotType === "beach") {
    if (nearest <= 2) {
      return {
        points: 35,
        reason: "Near tide change — useful for beach activity.",
      };
    }
    if (nearest <= 4) {
      return {
        points: 22,
        reason: "Moderate tide timing for the beach.",
      };
    }
    return {
      points: 10,
      reason: "Tide timing is not ideal right now.",
    };
  }

  // rocks
  if (nearest <= 2) {
    return {
      points: 38,
      reason: "Near tide change — good water movement around rocky structure.",
    };
  }
  if (nearest <= 4) {
    return {
      points: 24,
      reason: "Tide movement is still helpful around rocks.",
    };
  }
  return {
    points: 9,
    reason: "Far from a major tide turn.",
  };
}

function getTypeAdjustedWindScore(spotType: SpotType, wind: number | null) {
  if (wind === null) {
    return {
      points: 0,
      reason: "No wind data available yet.",
    };
  }

  if (spotType === "beach") {
    if (wind <= 10) {
      return {
        points: 25,
        reason: "Light wind — excellent for beach fishing.",
      };
    }
    if (wind <= 18) {
      return {
        points: 15,
        reason: "Wind is manageable on the beach.",
      };
    }
    if (wind <= 25) {
      return {
        points: 6,
        reason: "Beach conditions are getting rough.",
      };
    }
    return {
      points: 1,
      reason: "Too windy for comfortable beach fishing.",
    };
  }

  if (spotType === "jetty" || spotType === "estuary") {
    if (wind <= 12) {
      return {
        points: 25,
        reason: "Wind is light — very workable from shore.",
      };
    }
    if (wind <= 20) {
      return {
        points: 16,
        reason: "Wind is manageable for this shoreline spot.",
      };
    }
    if (wind <= 28) {
      return {
        points: 7,
        reason: "Wind is getting rough.",
      };
    }
    return {
      points: 1,
      reason: "Wind is too strong for good shore conditions.",
    };
  }

  // rocks
  if (wind <= 14) {
    return {
      points: 22,
      reason: "Wind is moderate and workable around rocks.",
    };
  }
  if (wind <= 22) {
    return {
      points: 13,
      reason: "Conditions are fishable but not ideal on rocks.",
    };
  }
  return {
    points: 3,
    reason: "Wind is rough around exposed rocky shore.",
  };
}

export function getFishingInsight(
  weather: WeatherData | null,
  tides: TideSummary | null,
  spotType: SpotType,
): FishingInsight {
  let score = 0;
  const reasons: string[] = [];
  const moon = getMoonPhase();

  const highIn = hoursUntil(tides?.nextHigh?.time ?? null);
  const lowIn = hoursUntil(tides?.nextLow?.time ?? null);

  const nearestCandidates = [highIn, lowIn].filter(
    (value): value is number => value !== null && value >= 0,
  );

  const nearest =
    nearestCandidates.length > 0 ? Math.min(...nearestCandidates) : null;

  const tideResult = getTypeAdjustedTideScore(spotType, nearest);
  score += tideResult.points;
  reasons.push(tideResult.reason);

  const windResult = getTypeAdjustedWindScore(
    spotType,
    weather?.windSpeed ?? null,
  );
  score += windResult.points;
  reasons.push(windResult.reason);

  if (moon.phaseName === "New Moon" || moon.phaseName === "Full Moon") {
    score += 15;
    reasons.push(
      `Moon phase (${moon.phaseName}) gives a useful activity boost.`,
    );
  } else if (
    moon.phaseName === "Waxing Gibbous" ||
    moon.phaseName === "Waning Gibbous" ||
    moon.phaseName === "Waxing Crescent" ||
    moon.phaseName === "Waning Crescent"
  ) {
    score += 10;
    reasons.push(`Moon phase (${moon.phaseName}) is moderately favorable.`);
  } else {
    score += 6;
    reasons.push(
      `Moon phase (${moon.phaseName}) is neutral to mildly helpful.`,
    );
  }

  const timeOfDay = getTimeOfDayScore();
  score += timeOfDay.points;
  reasons.push(timeOfDay.reason);

  const pressure = weather?.pressure ?? null;
  if (pressure !== null) {
    if (pressure >= 1008 && pressure <= 1020) {
      reasons.push("Pressure looks comfortable.");
    } else {
      reasons.push("Pressure is less ideal, but secondary to tide/wind here.");
    }
  }

  if (score > 100) score = 100;

  let rating: "Poor" | "Fair" | "Good" = "Poor";

  if (score >= 72) {
    rating = "Good";
  } else if (score >= 45) {
    rating = "Fair";
  }

  return {
    score,
    rating,
    moonPhase: moon.phaseName,
    reasons,
  };
}
