import * as R from 'ramda';

export function createHTMLTag(
  tag: string,
  attrs?: Record<string, any>,
  content: string = '',
  selfClosing: boolean = true,
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

  const start = `<${tag}${attrsStr}>`;
  if (!content && !selfClosing)
    return start;

  return `${start}${content}</${tag}>`;
}
