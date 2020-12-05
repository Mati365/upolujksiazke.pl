import * as R from 'ramda';

export type DebounceConfig = {
  delay: number,
  initialInstant?: boolean,
};

export type DebounceCallback = (...args: any[]) => any;

export const debounce = R.curry(
  (config: DebounceConfig, fn: DebounceCallback) => {
    const {delay, initialInstant = false} = (
      R.is(Number, config)
        ? {delay: config}
        : config
    ) as DebounceConfig;

    let timer = null;
    let firstCall = false;

    return (...args: any): Promise<any> => new Promise((resolve, reject) => {
      const safeCall = () => {
        try {
          resolve(fn(...args));
        } catch (e) {
          reject(e);
        }
      };

      if (!firstCall) {
        firstCall = true;
        if (initialInstant) {
          safeCall();
          return;
        }
      }

      if (!R.isNil(timer))
        clearTimeout(timer);

      timer = setTimeout(
        safeCall,
        delay,
      );
    });
  },
);
