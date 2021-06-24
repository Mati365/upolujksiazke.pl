import React, {KeyboardEventHandler} from 'react';

import {useI18n} from '@client/i18n';
import {genBooksSearchLink} from '@client/routes/Links';
import {useInputLink} from '@client/hooks/useInputLink';

import {Input} from '@client/components/ui/controls';
import {SearchIcon} from '@client/components/svg';

export const HeaderSearch = () => {
  const t = useI18n();
  const l = useInputLink<string>();

  const onSearch = () => {
    document.location.href = genBooksSearchLink(
      {
        phrase: l.value,
      },
    );
  };

  const onKeyDown: KeyboardEventHandler = (e) => {
    if (e.key === 'Enter')
      onSearch();
  };

  return (
    <Input
      className='c-header__search'
      placeholder={
        t('search.placeholder')
      }
      iconStyle='primary'
      iconRight={(
        <SearchIcon />
      )}
      onKeyDown={onKeyDown}
      onIconClick={onSearch}
      {...l.input()}
    />
  );
};

HeaderSearch.displayName = 'HeaderSearch';
