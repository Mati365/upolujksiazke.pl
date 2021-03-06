export type ListenersChain<T = Function> = [string[]|string, T][];

/**
 * @see
 *  [
 *    [['onTouchStart', 'onMouseDown'], this.onStart],
 *    onMouseDown: this.onStartSecond,
 *  ]
 *
 * transforms list of listeners to single object
 * {
 *   onTouchStart: this.onStart,
 *   onMouseDown: (e) => {
 *     onStart(e);
 *     onStartSecond(e);
 *   }
 * }
 *
 * @export
 * @param {ListenersChain} chain
 * @param {object} [target={}]
 * @returns {object}
 */
export function assignListenersChain(chain: ListenersChain, target: object = {}): object {
  const output = {};

  chain.forEach((pair) => {
    const [, listenerFn] = pair;
    let [keys] = pair;

    if (!(keys instanceof Array))
      keys = [keys];

    keys.forEach(
      (key) => {
        const prevListener = output[key];
        if (prevListener) {
          output[key] = (e) => {
            prevListener(e);
            listenerFn(e);
          };
        } else
          output[key] = listenerFn;
      },
    );
  });

  Object.assign(target, output);
  return target;
}
