import * as R from 'ramda';

export function findIndexByProp(keyName: string) {
  return (value: any) => (list: any[]): number => R.findIndex(
    R.propEq(keyName, value),
    list,
  );
}

export const findIndexByName = findIndexByProp('name');
export const findIndexById = findIndexByProp('id');
