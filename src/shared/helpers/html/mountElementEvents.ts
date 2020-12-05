import {forEachObjIndexed} from 'ramda';
import {assignListenersChain, ListenersChain} from './assignListenersChain';

/**
 * Due to Chrome 74 wheel pasive events issues,
 * add custom method that maps events and passes flag
 *
 * @todo
 *  Fixme when react introduce Passive events
 *
 *
 * @export
 * @param {AddEventListenerOptions} flags
 * @param {ListenersChain<EventListener> | Record<string, EventListener>} chain
 * @param {EventTarget} element
 * @returns
 */
export function mountElementEvents(
  flags: AddEventListenerOptions,
  chain: ListenersChain<EventListener> | Record<string, EventListener>,
  element: EventTarget,
) {
  const handlers = (
    chain instanceof Array
      ? assignListenersChain(chain)
      : chain
  );

  const iterateHandlers = (mapper: (handler: EventListener, event: string) => void) => (
    forEachObjIndexed(mapper, handlers)
  );

  iterateHandlers(
    (handler, event) => {
      element.addEventListener(event, handler, flags);
    },
  );

  return () => {
    iterateHandlers(
      (handler, event) => {
        element.removeEventListener(event, handler, flags);
      },
    );
  };
}
