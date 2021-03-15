/**
 * Wraps class method with decorator function
 *
 * @export
 * @template T
 * @param {(fn: T) => any} decorator
 * @returns
 */
export function WrapMethod<T extends Function = Function>(decorator: (fn: T) => any) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const wrappedFn = descriptor.value;
    let method: Function = null;

    descriptor.value = function innerWrapped(...args: any[]) {
      method ??= decorator.bind(this)(wrappedFn.bind(this));

      return method.apply(this, args);
    };
  };
}
