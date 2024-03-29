/* eslint-disable class-methods-use-this */
import * as R from 'ramda';

type ResultMatch<T, E, O> = {
  ok(value: T): O;
  err(value: E): O;
};

export abstract class Result<T, E, ValType = T | E> {
  protected _value: ValType;

  constructor(value: ValType) {
    this._value = value;
  }

  abstract isErr(): boolean;
  abstract isOk(): boolean;

  /**
   * Returns value from Result
   *
   * @abstract
   * @returns {ValType}
   * @memberof Result
   */
  abstract unwrap(): T | never;
  abstract unwrapErr(): E | never;
  abstract unwrapOr(val: T): T;
  abstract unwrapBoth(): [E, T];

  /**
   * Executes function provided via arg with monad value and returns its value
   *
   * @abstract
   * @template O
   * @param {(val: T) => Result<O, E>} fn
   * @returns {Result<O, E>}
   * @memberof Result
   */
  abstract andThen<O>(fn: (val: T) => Result<O, E>): Result<O, E>;

  /**
   * Rust match alternative, executes ok/err callback based on type
   *
   * @abstract
   * @template O
   * @param {ResultMatch<T, E, O>} match
   * @returns {O}
   * @memberof Result
   */
  abstract match<O>(match: ResultMatch<T, E, O>): O;

  /**
   * Modifies internal monad value and returns new value
   *
   * @abstract
   * @template O
   * @param {(fn: T) => O} fn
   * @returns {Result<O, E>}
   * @memberof Result
   */
  abstract map<O>(fn: (fn: T) => O): Result<O, E>;
}

/**
 * Success value
 *
 * @export
 * @class Ok
 * @extends {Result<T, E>}
 * @template T
 * @template E
 */
export class Ok<T, E = never> extends Result<T, E> {
  unwrap(): T {
    return <T> this._value;
  }

  unwrapErr(): never {
    throw new Error('Cannot unwrap error from ok!');
  }

  unwrapOr(): T {
    return <T> this._value;
  }

  unwrapBoth(): [E, T] {
    return [null, <T> this._value];
  }

  isOk() { return true; }

  isErr() { return false; }

  match<O>(match: ResultMatch<T, E, O>): O {
    return match.ok(<T> this._value);
  }

  map<O>(fn: (fn: T) => O): Ok<O, E> {
    return new Ok<O, E>(fn(<T> this._value));
  }

  andThen<O>(fn: (val: T) => Result<O, E>): Result<O, E> {
    return fn(<T> this._value);
  }
}

/**
 * Error value
 *
 * @export
 * @class Err
 * @extends {Result<T, E>}
 * @template T
 * @template E
 */
export class Err<T, E> extends Result<T, E> {
  unwrap(): T | never {
    throw new Error('Cannot unwrap error!');
  }

  unwrapErr(): E {
    return <E> this._value;
  }

  unwrapOr<A = T>(a: A): A {
    return a;
  }

  unwrapBoth(): [E, T] {
    return [<E> this._value, null];
  }

  isOk() { return false; }

  isErr() { return true; }

  match<O>(match: ResultMatch<T, E, O>): O {
    return match.err(<E> this._value);
  }

  map<O>(): Err<O, E> {
    return new Err<O, E>(<E> this._value);
  }

  andThen<O>(): Result<O, E> {
    return new Err<O, E>(<E> this._value);
  }
}

export const ok = <T>(value: T = null): Result<T, never> => new Ok<T>(value);
export const err = <E>(value?: E): Result<never, E> => new Err<never, E>(value);
export const errIfNil = <T> (value: T) => (
  R.isNil(value)
    ? err<void>()
    : ok(value)
);

/**
 * Reduces array of items to accumulator, if error stops and return error result
 *
 * @export
 * @template T
 * @template E
 * @template A
 * @param {(a: A) => Result<T, E>} mapper
 * @param {Ok<T>[]} init
 * @param {A[]} array
 * @returns {Result<Ok<T>[], E>}
 */
export function tryFold<A, T, E>(
  mapper: (a: A) => Result<T, E>,
  init: T[],
  array: A[] | Iterable<A>,
): Result<(T | null)[], E> {
  const acc: T[] = init || [];

  for (const item of array) {
    const result = mapper(item);

    if (result) {
      if (result.isErr())
        return <Err<never, E>> result;

      acc.push(<T> result.unwrap());
    } else
      acc.push(<null> result);
  }

  return ok(acc);
}

export function collect<A, T, E>(array: A[] | Iterable<A>): Result<(T | null)[], E> {
  return tryFold<A, T, E>(
    <any> R.identity,
    <T[]> [],
    array,
  );
}
