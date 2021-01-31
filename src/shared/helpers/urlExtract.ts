export function extractHostname(url: string) {
  if (!url.startsWith('http'))
    url = `https://${url}`;

  return new URL(url).hostname;
}
