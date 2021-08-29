/**
 * Assign node value to ref
 *
 * @export
 * @template T
 * @param {(Function|React.MutableRefObject<T>)} ref
 * @param {T} value
 * @returns {void}
 */
export function safeRefHandler<T>(ref: Function | React.MutableRefObject<T>, value: T): void {
  if (!ref)
    return;

  if ('current' in ref)
    ref.current = value;
  else
    ref(value);
}
