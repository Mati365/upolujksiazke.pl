let wrapperID = 0;

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
    const wrapperId = `__wrapped_${wrapperID++}`;

    descriptor.value = function innerWrapped(...args: any[]) {
      // eslint-disable-next-line no-multi-assign
      this[wrapperId] ??= decorator.bind(this)(wrappedFn.bind(this));
      return this[wrapperId](...args);
    };
  };
}
