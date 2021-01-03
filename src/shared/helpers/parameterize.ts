import * as R from 'ramda';

import {escapeDiacritics} from './escapeDiacritics';
import {removeSpecialCharacters} from './removeSpecialCharacters';

export const separatedParameterize = (separator: string): ((str: string) => string) => R.ifElse(
  R.either(
    R.isNil,
    R.isEmpty,
  ),
  R.always(''),
  R.compose(
    R.replace(/\s/g, separator),
    R.toLower,
    escapeDiacritics,
    removeSpecialCharacters,
    R.trim,
  ),
);

export const parameterize = separatedParameterize('-');
export const underscoreParameterize = separatedParameterize('_');
