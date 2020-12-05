import * as R from 'ramda';

export const dig = (path: string, obj: any) => R.view(R.lensPath(path.split('.')), obj);
