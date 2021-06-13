export function truncateText(maxLen: number, input: string) {
  if (input.length - maxLen > 5)
    return `${input.substring(0, maxLen)}...`;

  return input;
}
