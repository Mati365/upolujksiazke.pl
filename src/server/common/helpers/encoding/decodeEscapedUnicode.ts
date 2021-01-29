export const decodeEscapedUnicode = (str: string) => unescape(
  str.replace(
    /\\u([\d\w]{4})/gi,
    (match, grp) => String.fromCharCode(parseInt(grp, 16)),
  ),
);
