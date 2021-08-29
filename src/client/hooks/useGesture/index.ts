import {useRef} from 'react';
import {
  GestureStateContext,
  GestureListeners,
  WrappedHTMLListeners,
} from './GestureStateContext';

export * from './gestures/DragGesture';
export * from './gestures/PinchGesture';

/**
 * Mounts state gesture context
 *
 * @export
 * @param {GestureListeners} listeners
 * @returns {(() => WrappedHTMLListeners)}
 */
export function useGesture(listeners: GestureListeners): (() => WrappedHTMLListeners) {
  const gestureContextRef = useRef<GestureStateContext>(null);
  if (gestureContextRef.current === null)
    gestureContextRef.current = new GestureStateContext;

  return () => gestureContextRef.current.bind(listeners);
}
