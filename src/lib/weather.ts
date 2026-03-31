export type WeatherData = {
  temperature: number | null;
  windSpeed: number | null;
  pressure: number | null;
};

export async function getWeather(
  lat: number,
  lng: number,
): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,wind_speed_10m,pressure_msl`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch weather");
  }

  const data = await response.json();
  const current = data.current ?? {};

  return {
    temperature: current.temperature_2m ?? null,
    windSpeed: current.wind_speed_10m ?? null,
    pressure: current.pressure_msl ?? null,
  };
}
