export type AnyCallback = (...args: any[]) => any;

export type ID = string | number;

export type RemoteID = string;

export type CanBeArray<T> = T|T[];

export type IdentifiedItem<I = ID, R = {}> = R & {
  id: I,
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

export enum Gender {
  UNKNOWN = 1,
  FEMALE = 2,
  MALE = 3,
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
  gender?: Gender,
};
