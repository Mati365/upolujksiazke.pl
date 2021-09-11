export function dropTagAnchors(str: string) {
  let acc: string = '';

  for (let i = 0; i < str.length; ++i) {
    const c = str[i];

    if (str[i - 1] === '#' && c === '<' && str[i + 1] === 'a' && str[i + 2] === ' ') {
      // eat start
      for (; str[i - 1] !== '>' && i < str.length; ++i);

      // eat content
      for (; str[i] !== '<' && i < str.length; ++i)
        acc += str[i];

      // eat end
      for (; str[i] !== '>' && i < str.length; ++i);
    } else {
      // ignore if not tag
      acc += c;
    }
  }

  return acc;
}
