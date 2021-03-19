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

  return serializer.process(
    html
      .replace(/(&quot;|"{2,})/g, '"')
      .replace(/<br\s*[/]?>/g, '\n'),
  );
}

// http://lvh.me:3002/ksiazka/2010-odyseja-kosmiczna-arthur-c-clarke-1,292
