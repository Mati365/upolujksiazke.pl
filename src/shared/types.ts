export type ValueOf<T> = T[keyof T];

export type AnyCallback = (...args: any[]) => any;

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type ID = string | number;

export type RemoteID = string;

export type CanBeArray<T> = T | T[];

export type CanBePromise<T> = T | Promise<T>;

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

export type ListItem = {
  id: number,
  name: string,
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

export type SortKeys = {
  [key: string]: SortDirection,
};

export enum Currency {
  DOLLAR = '$',
  EURO = '€',
  PLN = 'zł',
}

export enum Gender {
  UNKNOWN = 1,
  FEMALE = 2,
  MALE = 3,
}

export type Person = {
  name: string,
  gender?: Gender,
};

export class Vec2 {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

export class Rect {
  constructor(
    public x: number,
    public y: number,
    public w: number,
    public h: number,
  ) {}
}

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

export function isPromise<T = any>(obj: any): obj is Promise<T> {
  return !!obj && 'then' in obj;
}
