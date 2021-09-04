export function convertDaysToSeconds(hours: number) {
  return hours * 86400;
}

export function convertHoursToSeconds(hours: number) {
  return hours * 3600;
}

export function convertMinutesToSeconds(hours: number) {
  return hours * 60;
}

export function convertMinutesToMiliseconds(hours: number) {
  return hours * 60_000;
}

export const PredefinedSeconds = {
  ONE_DAY: convertHoursToSeconds(24),
};
