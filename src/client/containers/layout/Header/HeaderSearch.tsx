import React, {KeyboardEventHandler} from 'react';

import {useI18n} from '@client/i18n';
import {genBooksSearchLink} from '@client/routes/Links';
import {pickEventValue} from '@client/hooks/useInputLink';

import {Input} from '@client/components/ui/controls';
import {SearchIcon} from '@client/components/svg';

export const HeaderSearch = () => {
  const t = useI18n();
  const onKeyDown: KeyboardEventHandler = (e) => {
    if (e.key !== 'Enter')
      return;

    document.location.href = genBooksSearchLink(
      {
        phrase: pickEventValue(e),
      },
    );
  };

  return (
    <Input
      className='c-header__search'
      placeholder={
        t('search.placeholder')
      }
      iconRight={(
        <SearchIcon />
      )}
      onKeyDown={onKeyDown}
    />
  );
};

HeaderSearch.displayName = 'HeaderSearch';
