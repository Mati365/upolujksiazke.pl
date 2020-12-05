import fs from 'fs';

export const loadFsJSON = <T = object>(path: string): T => {
  const json = fs.readFileSync(path).toString();
  let parsed = null;

  try {
    parsed = JSON.parse(json);
  } catch (e) {
    console.error(e);
  }

  return parsed;
};
