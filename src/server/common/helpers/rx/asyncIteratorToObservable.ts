import {Observable} from 'rxjs';

/**
 * @todo
 *  Remove it after merge:
 *  https://github.com/ReactiveX/rxjs/pull/5297/files
 *
 * @template T
 * @param {AsyncIterable<T>} asyncIterable
 * @returns
 */
export function asyncIteratorToObservable<T>(asyncIterable: AsyncIterable<T>) {
  return new Observable<T>((subscriber) => {
    (async () => {
      try {
        for await (const value of asyncIterable)
          subscriber.next(value);

        subscriber.complete();
      } catch (e) {
        subscriber.error(e);
      }
    })();
  });
}
