export const decodeEscapedUnicode = (str: string) => str && unescape(
  str.replace(
    /\\u([\d\w]{4})/gi,
    (match, grp) => String.fromCharCode(parseInt(grp, 16)),
  ),
);
