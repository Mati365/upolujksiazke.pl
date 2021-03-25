export function findObjectNonCasedKey(nonCasedKey: string, obj: any) {
  nonCasedKey = nonCasedKey.toLowerCase();

  for (const key in obj) {
    if (key.toLowerCase() === nonCasedKey)
      return key;
  }

  return null;
}
