export const safeParsePrice = (value: string) => (
  value
    ? Number.parseFloat(value)
    : null
);
