import {
  useRef,
  useState,
  useEffect,
} from 'react';

import * as R from 'ramda';

import {BehaviorSubjectObservable} from '@shared/helpers/classes/Observable';
import {useMountedIndicatorRef} from './useMounted';

/**
 * @see createLowLatencyObservable
 */
export const useLowLatencyObservable = <T> (
  {
    parserFn = R.identity,
    watchOnly,
    observable,
    onChange,
  }: {
    parserFn?: (val: T) => T,
    onChange?: (val: T) => void,
    watchOnly?: boolean,
    observable: BehaviorSubjectObservable<T>,
  },
): T => {
  const mountedRef = useMountedIndicatorRef();
  const changeListenerRef = useRef<(val: T) => void>();
  const [state, setState] = useState<{value: T}>(
    {
      value: observable.getLastValue(),
    },
  );

  changeListenerRef.current = onChange;

  useEffect(
    () => observable.subscribe(
      (newValue) => {
        if (!mountedRef.current)
          return;

        const parsedValue = parserFn(newValue);

        if (watchOnly && changeListenerRef.current)
          changeListenerRef.current(parsedValue);
        else {
          setState(
            {
              value: parsedValue,
            },
          );
        }
      },
      false,
    ),
    [observable],
  );

  return state.value;
};
