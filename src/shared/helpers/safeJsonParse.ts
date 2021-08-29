export function safeJsonParse(str: string) {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error(e);
    return null;
  }
}
