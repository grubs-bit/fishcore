export type MoonPhaseResult = {
  phaseName: string;
  phaseValue: number;
};

export function getMoonPhase(date = new Date()): MoonPhaseResult {
  const synodicMonth = 29.53058867;
  const knownNewMoon = new Date("2000-01-06T18:14:00Z").getTime();
  const now = date.getTime();

  const daysSinceKnownNewMoon = (now - knownNewMoon) / (1000 * 60 * 60 * 24);

  const currentCycleDay =
    ((daysSinceKnownNewMoon % synodicMonth) + synodicMonth) % synodicMonth;

  const phaseValue = currentCycleDay / synodicMonth;

  let phaseName = "New Moon";

  if (phaseValue < 0.0625 || phaseValue >= 0.9375) {
    phaseName = "New Moon";
  } else if (phaseValue < 0.1875) {
    phaseName = "Waxing Crescent";
  } else if (phaseValue < 0.3125) {
    phaseName = "First Quarter";
  } else if (phaseValue < 0.4375) {
    phaseName = "Waxing Gibbous";
  } else if (phaseValue < 0.5625) {
    phaseName = "Full Moon";
  } else if (phaseValue < 0.6875) {
    phaseName = "Waning Gibbous";
  } else if (phaseValue < 0.8125) {
    phaseName = "Last Quarter";
  } else {
    phaseName = "Waning Crescent";
  }

  return {
    phaseName,
    phaseValue,
  };
}
