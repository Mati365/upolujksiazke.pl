export type AnyCallback = (...args: any[]) => any;

export type ID = string | number;

export type CanBeArray<T> = T|T[];

export type IdentifiedItem<R = {}> = R & {
  id: ID,
};

export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];

export type ListItem = {
  id?: ID,
  name: string | number,
};

export type DatedItem = {
  createdAt: Date,
  updatedAt: Date,
};

export type Duration<T = Date> = {
  begin?: T,
  end?: T,
};

export enum SortDirection {
  DESC = 'desc',
  ASC = 'asc',
  NORMAL = '',
}

export type Vec2 = {
  x?: number,
  y?: number,
};

export type Size = Vec2 & {
  w?: number,
  h?: number,
};

export type SortKeys = {
  [key: string]: SortDirection,
};

export type Person = {
  name: string,
};
