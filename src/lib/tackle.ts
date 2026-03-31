import type { SpotType } from "../store/spots";

export type TackleRecommendation = {
  baitType: string;
  sinkerRangeGrams: string;
  waveForce: string;
  reason: string;
};

function getWaveForceLabel(waveHeight: number | null) {
  if (waveHeight == null) return "Unknown";
  if (waveHeight < 0.3) return "Calm";
  if (waveHeight < 0.8) return "Light";
  if (waveHeight < 1.5) return "Moderate";
  if (waveHeight < 2.2) return "Rough";
  return "Heavy";
}

function getBeachRecommendation(
  waveHeight: number | null,
  wind: number | null,
): TackleRecommendation {
  const waveForce = getWaveForceLabel(waveHeight);

  if ((waveHeight ?? 0) < 0.5 && (wind ?? 0) <= 12) {
    return {
      baitType: "Shrimp / small natural bait / light cut bait",
      sinkerRangeGrams: "30–60 g",
      waveForce,
      reason: "Beach is relatively calm, so lighter bottom setups should hold.",
    };
  }

  if ((waveHeight ?? 0) < 1.2 && (wind ?? 0) <= 20) {
    return {
      baitType: "Cut bait / shrimp / sardine chunks",
      sinkerRangeGrams: "60–90 g",
      waveForce,
      reason: "Moderate surf needs more holding power from shore.",
    };
  }

  if ((waveHeight ?? 0) < 2.0) {
    return {
      baitType: "Cut bait / stronger scent bait",
      sinkerRangeGrams: "90–125 g",
      waveForce,
      reason: "Rougher beach wash usually needs heavier holding weight.",
    };
  }

  return {
    baitType: "Heavy cut bait setup",
    sinkerRangeGrams: "125–170 g",
    waveForce,
    reason:
      "Heavy surf from shore — use serious holding weight or reconsider fishing.",
  };
}

function getJettyRecommendation(
  waveHeight: number | null,
  wind: number | null,
): TackleRecommendation {
  const waveForce = getWaveForceLabel(waveHeight);

  if ((waveHeight ?? 0) < 0.6 && (wind ?? 0) <= 14) {
    return {
      baitType: "Live bait / cut bait / soft plastics",
      sinkerRangeGrams: "30–60 g",
      waveForce,
      reason:
        "Jetty conditions are controlled enough for lighter presentations.",
    };
  }

  if ((waveHeight ?? 0) < 1.4 && (wind ?? 0) <= 22) {
    return {
      baitType: "Live bait / cut bait / jigs",
      sinkerRangeGrams: "60–90 g",
      waveForce,
      reason:
        "Moderate movement around a jetty favors a sturdier bottom setup.",
    };
  }

  return {
    baitType: "Cut bait / live bait",
    sinkerRangeGrams: "90–125 g",
    waveForce,
    reason: "More wash/current around the jetty means heavier tackle is safer.",
  };
}

function getRockRecommendation(
  waveHeight: number | null,
  wind: number | null,
): TackleRecommendation {
  const waveForce = getWaveForceLabel(waveHeight);

  if ((waveHeight ?? 0) < 0.7 && (wind ?? 0) <= 14) {
    return {
      baitType: "Live bait / cut bait / sturdy lure",
      sinkerRangeGrams: "40–70 g",
      waveForce,
      reason: "Rocks are fishable and relatively controlled.",
    };
  }

  if ((waveHeight ?? 0) < 1.5 && (wind ?? 0) <= 22) {
    return {
      baitType: "Live bait / cut bait",
      sinkerRangeGrams: "70–100 g",
      waveForce,
      reason: "Moderate wash around rocks needs a stronger hold.",
    };
  }

  return {
    baitType: "Heavy cut bait / live bait",
    sinkerRangeGrams: "100–140 g",
    waveForce,
    reason: "Rocks with rough wash need heavier tackle and caution.",
  };
}

function getEstuaryRecommendation(
  waveHeight: number | null,
  wind: number | null,
): TackleRecommendation {
  const waveForce = getWaveForceLabel(waveHeight);

  if ((waveHeight ?? 0) < 0.4 && (wind ?? 0) <= 12) {
    return {
      baitType: "Shrimp / small live bait / soft plastics",
      sinkerRangeGrams: "15–40 g",
      waveForce,
      reason: "Estuary water is relatively calm, so lighter rigs are enough.",
    };
  }

  if ((waveHeight ?? 0) < 0.9 && (wind ?? 0) <= 20) {
    return {
      baitType: "Shrimp / baitfish / soft plastics",
      sinkerRangeGrams: "40–70 g",
      waveForce,
      reason: "Moderate estuary movement needs slightly more weight.",
    };
  }

  return {
    baitType: "Shrimp / cut bait / baitfish",
    sinkerRangeGrams: "70–90 g",
    waveForce,
    reason: "Stronger flow in the estuary favors heavier bottom control.",
  };
}

export function getTackleRecommendation(
  spotType: SpotType,
  waveHeight: number | null,
  wind: number | null,
): TackleRecommendation {
  switch (spotType) {
    case "beach":
      return getBeachRecommendation(waveHeight, wind);
    case "jetty":
      return getJettyRecommendation(waveHeight, wind);
    case "rocks":
      return getRockRecommendation(waveHeight, wind);
    case "estuary":
      return getEstuaryRecommendation(waveHeight, wind);
    default:
      return {
        baitType: "General natural bait",
        sinkerRangeGrams: "40–80 g",
        waveForce: getWaveForceLabel(waveHeight),
        reason: "Fallback recommendation.",
      };
  }
}
