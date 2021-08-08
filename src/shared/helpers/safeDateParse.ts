export function isValidDate(date: Date) {
  return date instanceof Date && !Number.isNaN(date);
}

export function safeDateParse(str: string) {
  const date = new Date(str);
  if (!isValidDate(date))
    return null;

  return date;
}
