import React, {useMemo} from 'react';

import {useI18n} from '@client/i18n';

import {InputLabel} from '@client/components/ui';
import {
  SelectInput,
  SelectInputProps,
} from '@client/components/ui/controls';

type PageSizeSelectInputProps = Omit<SelectInputProps, 'items'> & {
  sizes: number[],
};

export const PageSizeSelectInput = ({sizes, ...props}: PageSizeSelectInputProps) => {
  const t = useI18n();
  const items = useMemo(
    () => sizes.map((item) => ({
      id: item,
      name: item.toString(),
    })),
    [sizes],
  );

  return (
    <InputLabel
      label={
        t('shared.titles.per_page')
      }
    >
      <SelectInput
        returnOnlyId
        items={items}
        inputProps={{
          style: {
            width: 64,
          },
        }}
        {...props}
      />
    </InputLabel>
  );
};

PageSizeSelectInput.displayName = 'PageSizeSelectInput';
