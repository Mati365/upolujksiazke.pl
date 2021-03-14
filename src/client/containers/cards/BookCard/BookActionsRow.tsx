import React from 'react';

import {useI18n} from '@client/i18n';
import {Button} from '@client/components/ui';
import {
  BasketIcon,
  ChevronRightIcon,
} from '@client/components/svg';

export const BookActionRow = () => {
  const t = useI18n();

  return (
    <Button
      className='c-book-card__cta'
      type='primary'
      size='medium-small'
      iconSuffix
    >
      <BasketIcon className='mr-1 c-book-card__cta__basket-icon' />
      {t('shared.book.compare')}
      <ChevronRightIcon />
    </Button>
  );
};

BookActionRow.displayName = 'BookActionRow';
