import {parse} from 'content-type';

export function parseContentType(contentType: string) {
  try {
    return parse(contentType).parameters.charset;
  } catch {
    return contentType;
  }
}
