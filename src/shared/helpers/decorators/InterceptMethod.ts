import {WrapMethod} from './WrapMethod';

export function InterceptMethod(fn: (...args: any[]) => void | ((result: any) => void)) {
  const innerWrapper = function innerWrapper(wrappedFn: Function) {
    return function wrappedIntercept(...args: any[]) {
      const unmounter = fn.apply(this, args);
      const result = wrappedFn(...args);

      if (unmounter instanceof Function)
        unmounter.apply(this, [result]);

      return result;
    };
  };

  return WrapMethod(innerWrapper);
}
