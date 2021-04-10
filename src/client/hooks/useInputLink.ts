import {useRef, useState} from 'react';
import * as R from 'ramda';

type PropertyWatchersMap = Record<string, {
  value?: any,
  onChange?(val: any, prevVal: any): void,
}>;

/**
 * Typedef
 */
export type LinkPropertyWatchers<T> = PropertyWatchersMap | ((value: T) => PropertyWatchersMap);

export type LinkInputConfig<T> = {
  initialData?: T | (() => T),
  value?: T,
  valuePropWatchers?: LinkPropertyWatchers<T>,
  onChange?(val: T): void,
};

export type LinkInputProps<T> = {
  value: T,
  onChange(e: any): any,
};

export type InputLinkerFn<T> = (
  name?: string,
  params?: {
    uncontrolled?: boolean,
    defaultValue?: any,
    relatedInputsFn?(newValue: any, value: any): Partial<T>,
    valueParserFn?(val: any): any,
    assignValueParserFn?(val: any): any,
  },
) => LinkInputProps<any>;

export type LinkInputAttachParams<T> = {
  initialData: T,
  value: T,
  setValue: (val: T) => void,

  input: InputLinkerFn<T>,
  numericInput: (name?: string, params?: any) => LinkInputProps<T>,
};

/**
 * Pick value
 */
export const pickEventValue = R.unless(
  R.either(R.isNil, R.is(String)),
  R.ifElse(
    R.has('target'),
    R.compose(
      R.cond([
        [R.propEq('type', 'checkbox'), R.prop('checked')],
        [R.propEq('type', 'file'), ({files}) => files[0]],
        [R.T, R.prop('value')],
      ]),
      R.prop('target'),
    ),
    R.identity,
  ),
);

/**
 * Linker helper types typescript
 */
export const useInputLink = <T>(
  {
    value: forwardedValue,
    valuePropWatchers,
    initialData,
    onChange,
  }: LinkInputConfig<T> = {},
) => {
  const initial = forwardedValue || initialData;
  const [outerValue, setOuterValue] = useState<{value: T}>(
    () => ({
      value: (
        initial instanceof Function
          ? initial()
          : initial
      ),
    }),
  );

  const watchers = (
    valuePropWatchers instanceof Function
      ? valuePropWatchers(outerValue.value ?? ({} as T))
      : valuePropWatchers
  );

  const valueRef = useRef<typeof outerValue>();
  const setValue = (newValue: T, noRerender?: boolean) => {
    valueRef.current.value = newValue;

    if (noRerender) {
      outerValue.value = newValue;
      return;
    }

    setOuterValue(
      {
        value: newValue,
      },
    );
  };

  if (forwardedValue !== undefined && outerValue.value !== forwardedValue)
    outerValue.value = forwardedValue;

  if (valuePropWatchers) {
    if (!R.is(Object, outerValue.value))
      outerValue.value = {} as any;

    for (const key in watchers) {
      if (!Object.prototype.hasOwnProperty.call(watchers, key))
        continue;

      outerValue.value[key] = watchers[key].value;
    }
  }

  valueRef.current = outerValue;

  const safeUpdateValue = (newValue: T) => {
    if (watchers) {
      const prevValue = valueRef.current;
      let propChanged = false;

      setValue(newValue, true);

      for (const key in watchers) {
        if (!Object.prototype.hasOwnProperty.call(watchers, key))
          continue;

        const propWatcher = watchers[key];
        const [prevPropValue, newPropValue] = [
          prevValue && prevValue[key],
          newValue && newValue[key],
        ];

        if (newPropValue !== prevPropValue) {
          propWatcher.onChange(newPropValue, prevPropValue);
          propChanged = true;
        }
      }

      if (propChanged)
        return;
    }

    if (onChange)
      onChange(newValue);

    if (R.isNil(forwardedValue) || !onChange)
      setValue(newValue);
  };

  const inputFn: InputLinkerFn<T> = (
    name?: string,
    {
      uncontrolled = false,
      defaultValue = '',
      relatedInputsFn = null,
      valueParserFn = R.identity,
      assignValueParserFn = R.identity,
    } = {},
  ): LinkInputProps<T> => {
    const lensPath = name && R.lensPath(name.split('.'));
    const inputValue = !uncontrolled && assignValueParserFn(
      <any> R.defaultTo(
        defaultValue,
        (
          name
            ? R.view(lensPath, outerValue.value ?? {})
            : outerValue.value
        ),
      ),
    );

    return {
      ...!uncontrolled && {
        value: inputValue,
      },
      onChange(e: Event) {
        const newValue = valueParserFn(pickEventValue(e));
        let newStateValue: T = newValue;

        if (name) {
          newStateValue = R.set(
            lensPath,
            newValue,
            {
              ...outerValue.value,
              ...relatedInputsFn && relatedInputsFn(newValue, inputValue),
            },
          );
        } else if (R.equals(inputValue, newValue))
          return;

        safeUpdateValue(newStateValue);
      },
    };
  };

  return <LinkInputAttachParams<T>> {
    get value() {
      return valueRef.current.value;
    },
    set value(v) {
      valueRef.current.value = v;
    },

    initialData: initial,
    setValue: safeUpdateValue,

    input: inputFn,
    numericInput: (name?: string, params?: any): LinkInputProps<T> => inputFn(name, {
      ...params,
      valueParserFn: Number.parseInt,
    }),
  };
};
