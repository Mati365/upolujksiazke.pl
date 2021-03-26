import * as R from 'ramda';

export function createHTMLTag(
  tag: string,
  attrs?: Record<string, any>,
  content: string = '',
) {
  const attrsStr = (
    attrs
      ? ` ${R
        .toPairs(attrs)
        .reduce(
          (acc, [name, value]) => {
            acc.push(`${name}="${value}"`);
            return acc;
          },
          [],
        )
        .join(' ')}`
      : ''
  );

  return `<${tag}${attrsStr}>${content}</${tag}>`;
}
