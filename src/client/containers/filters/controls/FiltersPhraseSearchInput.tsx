import React from 'react';
import {Input, InputProps} from '@client/components/ui/controls';
import {SearchIcon} from '@client/components/svg/Icons';

type FiltersPhraseSearchInputProps = Omit<InputProps, 'iconLeft'>;

export const FiltersPhraseSearchInput = (props: FiltersPhraseSearchInputProps) => (
  <Input
    iconLeft={(
      <SearchIcon />
    )}
    {...props}
  />
);

FiltersPhraseSearchInput.displayName = 'FiltersPhraseSearchInput';
