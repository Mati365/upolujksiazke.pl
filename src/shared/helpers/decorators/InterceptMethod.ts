import {WrapMethod} from './WrapMethod';

export type InterceptedFn = (...args: any[]) => void | ((result: any, wrapperFn: any) => void);

export function InterceptMethod(fn: InterceptedFn) {
  const innerWrapper = function innerWrapper(wrappedFn: Function) {
    return function wrappedIntercept(...args: any[]) {
      const unmounter = fn.apply(this, args);
      let result = wrappedFn(...args, wrappedFn);

      if (unmounter instanceof Function) {
        if (result && 'then' in result) {
          result = result.then(function thenWrapper(r: any) {
            unmounter.apply(this, [r, wrappedFn]);
            return r;
          });
        } else
          unmounter.apply(this, [result, wrappedFn]);
      }

      return result;
    };
  };

  return WrapMethod(innerWrapper);
}
