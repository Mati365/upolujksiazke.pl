export function countLetter(letter: string, str: string) {
  if (!str)
    return 0;

  let number = 0;
  for (let i = str.length - 1; i >= 0; --i)
    number += +(str[i] === letter);

  return number;
}
