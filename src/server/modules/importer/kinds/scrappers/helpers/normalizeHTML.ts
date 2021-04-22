import {stripHtml} from 'string-strip-html';

export function normalizeHTML(
  html: string,
  {
    stripNewlines = true,
  }: {
    stripNewlines?: boolean,
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

  if (stripNewlines)
    output = output.replace(/\n{1,}/g, '');

  return (
    output
      .trim()
      .replace(/(?:<br\s*\/>)+$/, '')
  );
}
