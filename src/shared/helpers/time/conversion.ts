export function convertHoursToSeconds(hours: number) {
  return hours * 3600;
}

export function convertMinutesToSeconds(hours: number) {
  return hours * 60;
}

export const PredefinedSeconds = {
  ONE_DAY: convertHoursToSeconds(24),
};
