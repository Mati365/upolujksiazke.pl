import React, {useMemo} from 'react';

import {useI18n} from '@client/i18n';

import {SortMode} from '@shared/enums';
import {InputLabel} from '@client/components/ui';
import {
  SelectInput,
  SelectInputProps,
} from '@client/components/ui/controls';

const DEFAULT_SORT_MODES = [
  SortMode.ACCURACY,
  SortMode.POPULARITY,
  SortMode.ALPHABETIC,
];

type SortSelectInputProps = Omit<SelectInputProps, 'items'> & {
  modes?: SortMode[],
};

export const SortSelectInput = (
  {
    modes = DEFAULT_SORT_MODES,
    ...props
  }: SortSelectInputProps,
) => {
  const t = useI18n();
  const items = useMemo(
    () => modes.map((mode) => ({
      id: mode,
      name: t(`shared.filters.modes.${mode}`),
    })),
    [modes],
  );

  return (
    <InputLabel
      label={
        t('shared.filters.sort_by')
      }
    >
      <SelectInput
        returnOnlyId
        items={items}
        inputProps={{
          style: {
            width: 144,
          },
        }}
        {...props}
      />
    </InputLabel>
  );
};

SortSelectInput.displayName = 'SortSelectInput';
