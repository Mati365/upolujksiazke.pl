export function extractHostname(url: string) {
  return new URL(url).hostname;
}
