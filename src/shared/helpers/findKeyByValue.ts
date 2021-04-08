export function findKeyByValue(value: any, obj: any) {
  for (const key in obj) {
    if (obj[key] === value)
      return key;
  }

  return null;
}
