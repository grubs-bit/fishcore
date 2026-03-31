export type TidePoint = {
  time: string;
  height: number;
};

export type TideSummary = {
  currentHeight: number | null;
  currentWaveHeight: number | null;
  nextHigh: TidePoint | null;
  nextLow: TidePoint | null;
  tideTrend: "Rising" | "Falling" | "Stable" | "Unknown";
};

function findNextExtrema(times: string[], heights: number[]) {
  let nextHigh: TidePoint | null = null;
  let nextLow: TidePoint | null = null;

  for (let i = 1; i < heights.length - 1; i++) {
    const prev = heights[i - 1];
    const curr = heights[i];
    const next = heights[i + 1];

    if (nextHigh === null && curr > prev && curr > next) {
      nextHigh = {
        time: times[i],
        height: curr,
      };
    }

    if (nextLow === null && curr < prev && curr < next) {
      nextLow = {
        time: times[i],
        height: curr,
      };
    }

    if (nextHigh && nextLow) {
      break;
    }
  }

  return { nextHigh, nextLow };
}

function getTideTrend(heights: number[]) {
  if (!heights || heights.length < 3) {
    return "Unknown" as const;
  }

  const h0 = heights[0];
  const h1 = heights[1];
  const h2 = heights[2];

  const avgDelta = (h1 - h0 + (h2 - h1)) / 2;

  if (avgDelta > 0.01) return "Rising" as const;
  if (avgDelta < -0.01) return "Falling" as const;
  return "Stable" as const;
}

export async function getTides(lat: number, lng: number): Promise<TideSummary> {
  const url =
    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}` +
    `&hourly=sea_level_height_msl&current=wave_height,sea_level_height_msl` +
    `&forecast_days=3&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch tide data");
  }

  const data = await response.json();

  const hourly = data.hourly ?? {};
  const current = data.current ?? {};

  const times: string[] = hourly.time ?? [];
  const heights: number[] = hourly.sea_level_height_msl ?? [];

  const tideTrend = getTideTrend(heights);

  if (!times.length || !heights.length) {
    return {
      currentHeight: current.sea_level_height_msl ?? null,
      currentWaveHeight: current.wave_height ?? null,
      nextHigh: null,
      nextLow: null,
      tideTrend: "Unknown",
    };
  }

  const { nextHigh, nextLow } = findNextExtrema(times, heights);

  return {
    currentHeight: current.sea_level_height_msl ?? heights[0] ?? null,
    currentWaveHeight: current.wave_height ?? null,
    nextHigh,
    nextLow,
    tideTrend,
  };
}

export function formatTideTime(value: string) {
  const date = new Date(value);

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
