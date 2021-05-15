import {ReactNode} from 'react';
import {SortDirection} from './enums';

export * from './enums';

export type ValueOf<T> = T[keyof T];

export type AnyCallback = (...args: any[]) => any;

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type ID = string | number;

export type RemoteID = string;

export type CanBeArray<T> = T | T[];

export type CanBePromise<T> = T | Promise<T>;

export type CanBeFunction<T, A> = T | ((attrs: A) => T);

export type CanBeVoidFunction<T> = T | (() => T);

export type IdentifiedItem<I = ID, R = {}> = R & {
  id: I,
};

export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];

export type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

export type AwaitedObject<T> = {
  [key in keyof T]: Awaited<T[key]>
};

export type CreateObjArrayType<Type> = Partial<{
  +readonly [Key in keyof Type]: Type[Key][];
}>;

export type ListItem = {
  id: number,
  name: string,
};

export type ReactListItem = {
  id: number,
  name: ReactNode,
};

export type CountedListItem = ListItem & {
  count?: number,
};

export type IconListItem = ListItem & {
  icon?: any,
};

export type DatedItem = {
  createdAt: Date,
  updatedAt: Date,
};

export type Duration<T = Date> = {
  begin?: T,
  end?: T,
};

export type MinMaxRange = {
  min?: number,
  max?: number,
};

export type BasicLimitPaginationOptions = {
  offset?: number,
  limit?: number,
};

export type PaginationMeta = BasicLimitPaginationOptions & {
  page?: number,
  totalItems?: number,
  totalPages?: number,
};

export type PaginationResult<T> = {
  items: (Record<string, any> | T)[],
  meta: PaginationMeta,
};

export type SortKeys = {
  [key: string]: SortDirection,
};

export class Size {
  constructor(
    public w: number,
    public h: number,
  ) {}
}

export class ImageResizeSize {
  constructor(
    public w: number | '',
    public h: number | '',
  ) {}
}
