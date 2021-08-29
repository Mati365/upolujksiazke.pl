import React, {useEffect, useRef, useState} from 'react';
import * as R from 'ramda';

import {safeJsonParse} from '@shared/helpers';
import {useUpdateEffect} from './useUpdateEffect';

function createLocalStorageAccessor<T = any, O = T>(
  {
    keyName,
    defaultExpire = 300,
    precomputeFields = R.identity as any,
    defaultValue = null,
    allowReadCache = true,
  }: {
    keyName: string,
    defaultExpire?: number,
    allowReadCache?: boolean,
    defaultValue?: O,
    precomputeFields?: (value: T) => O,
  },
) {
  const context = {
    __cache: null,

    /**
     * Removes value from localstorage
     */
    removeFromStorage() {
      localStorage.removeItem(keyName);
    },

    /**
     * Returns value, if not present returns defaultValue
     *
     * @returns
     */
    readValue() {
      if (allowReadCache && context.__cache)
        return context.__cache.value;

      const value = precomputeFields(
        R.defaultTo(
          defaultValue,
          (() => {
            const data = safeJsonParse(localStorage.getItem(keyName));
            if (!data)
              return null;

            if (Date.now() >= data.expire) {
              localStorage.removeItem(keyName);
              return null;
            }

            return data.value;
          })(),
        ),
      );

      context.__cache = {
        value,
      };

      return value;
    },

    /**
     * Sets value into localstorage
     *
     * @param {any} value
     * @param {number} [expire=defaultExpire] in seconds
     */
    writeValue(value: any, expire: number = defaultExpire) {
      value = precomputeFields(value);

      context.__cache = {
        value,
      };

      localStorage.setItem(
        keyName,
        JSON.stringify(
          {
            expire: Date.now() + expire * 1000,
            value,
          },
        ),
      );
    },
  };

  Object.defineProperty(context, 'value', {
    get() {
      return context.readValue();
    },

    set(newValue) {
      context.writeValue(newValue);
    },

    enumerable: true,
    configurable: true,
  });

  return context;
}

export function useLocalStorageState<T>(
  {
    name,
    initialState,
    expire,
  }: {
    name: string,
    initialState?: T,
    expire?: number,
  },
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const accessor = useRef<ReturnType<typeof createLocalStorageAccessor>>();
  const dumped = useRef<boolean>(false);

  if (!accessor.current) {
    accessor.current = createLocalStorageAccessor(
      {
        keyName: name,
        defaultExpire: expire,
      },
    );
  }

  const [state, setState] = useState(initialState);

  useEffect(
    () => {
      setState(
        accessor.current.readValue(),
      );
    },
    [],
  );

  useUpdateEffect(
    () => {
      if (!dumped.current) {
        dumped.current = true;
        return;
      }

      accessor.current.writeValue(state);
    },
    [state],
  );

  return [state, setState];
}
