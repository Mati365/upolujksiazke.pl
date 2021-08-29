export function findKeyByValue(value: any, obj: any) {
  if (!obj)
    return null;

  for (const key in obj) {
    if (obj[key] === value)
      return key;
  }

  return null;
}
