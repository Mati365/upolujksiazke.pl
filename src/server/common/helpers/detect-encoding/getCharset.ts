import {load} from 'cheerio';
import {parseContentType} from './parseContentType';

export function getCharset(content: Buffer, headers?: Headers) {
  let charset: string;

  const contentType = headers?.get('content-type');
  if (contentType) {
    charset = parseContentType(contentType);
  }

  const data = content.slice(0, 1024).toString();

  if (!charset && data) {
    const $ = load(data);

    charset = parseContentType(
      $('meta[charset]').attr('charset')
        || $('meta[http-equiv=Content-Type][content]').attr('content')
        || load(data.replace(/<\?(.*)\?>/im, '<$1>'), {xmlMode: true})
          .root()
          .find('xml')
          .attr('encoding'),
    );

    // Prevent decode issues when sites use incorrect encoding
    // ref: https://hsivonen.fi/encoding-menu/
    if (charset && ['gb2312', 'gbk'].includes(charset.toLowerCase())) {
      charset = 'gb18030';
    }
  }

  return charset || 'utf-8';
}
