import slugify from 'slugify';

const PARAMETRIZE_REGEX = /[^\w\s-]+/g;

export const parameterize = (str: string) => slugify(
  str,
  {
    lower: true,
    remove: PARAMETRIZE_REGEX,
    replacement: '-',
  },
);

export const underscoreParameterize = (str: string) => slugify(
  str,
  {
    lower: true,
    remove: PARAMETRIZE_REGEX,
    replacement: '_',
  },
);
