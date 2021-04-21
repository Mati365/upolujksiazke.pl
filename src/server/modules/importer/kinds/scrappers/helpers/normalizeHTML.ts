import {stripHtml} from 'string-strip-html';

export function normalizeHTML(
  html: string,
  {
    stripDoubledNewlines = true,
  }: {
    stripDoubledNewlines?: boolean,
  } = {},
) {
  if (!html)
    return html;

  let {result: output} = stripHtml(
    html
      .replace(/&nbsp;/g, '')
      .replace(/(&quot;|"{2,})/g, '"'),
    {
      ignoreTags: ['cite', 'br', 'spoiler', 'b', 'i', 'strong', 'em'],
    },
  );

  if (stripDoubledNewlines)
    output = output.replace(/\s*\n[\n\s]{1,}/g, '\n\n');

  return (
    output
      .trim()
      .replace(/(?:<br\s*\/>)+$/, '')
  );
}
