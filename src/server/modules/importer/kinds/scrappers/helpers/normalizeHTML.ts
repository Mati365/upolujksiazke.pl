import {FilterXSS} from 'xss';

const serializer = new FilterXSS(
  {
    css: false,
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'template', 'svg'],
  },
);

export function normalizeHTML(html: string) {
  if (!html)
    return html;

  const output = serializer.process(html.replace(/(&quot;|"{2,})/g, '"'));
  return output.replace(/\n{3,}/g, '\n\n');
}
