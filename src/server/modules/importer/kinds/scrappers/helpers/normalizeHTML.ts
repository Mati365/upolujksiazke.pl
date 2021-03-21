import {stripHtml} from 'string-strip-html';

export function normalizeHTML(html: string) {
  if (!html)
    return html;

  const {result: output} = stripHtml(
    html
      .replace(/&nbsp;/g, '')
      .replace(/(&quot;|"{2,})/g, '"')
      .replace(/<br\s*[/]?>/g, '\n'),
  );

  return (
    output
      .replace(/\s*\n[\n\s]{1,}/g, '\n\n')
      .trim()
  );
}
