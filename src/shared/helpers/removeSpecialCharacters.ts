import * as R from 'ramda';

export const removeSpecialCharacters = R.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi, '');
