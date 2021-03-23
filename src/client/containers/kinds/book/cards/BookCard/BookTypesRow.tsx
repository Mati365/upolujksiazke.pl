import React, {ComponentType} from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';

import {BookType} from '@shared/enums';
import {CleanList} from '@client/components/ui';
import {
  HeadphoneIcon,
  DevicesIcon,
  BookIcon,
} from '@client/components/svg';

export const BookTypesIconsMap: Record<BookType, ComponentType<any>> = {
  [BookType.EBOOK]: DevicesIcon,
  [BookType.AUDIOBOOK]: HeadphoneIcon,
  [BookType.PAPER]: BookIcon,
};

export const BookTypesIcons: [BookType, ComponentType<any>][] = R.toPairs(BookTypesIconsMap);

type BookTypesRowProps = {
  types: BookType[],
};

export const BookTypesRow = ({types}: BookTypesRowProps) => {
  const t = useI18n();
  const icons = BookTypesIcons.map(([type, Icon]) => (
    <li
      key={type}
      className={c(
        'c-book-types__item',
        !types.find((item) => +item === +type) && 'is-text-inactive',
      )}
    >
      <Icon
        title={
          t(`shared.book.types.${type}`)
        }
      />
    </li>
  ));

  return (
    <div className='c-book-card__types'>
      <span className='is-text-muted is-text-small'>
        {t('shared.book.available_types')}
      </span>

      <CleanList
        inline
        spaced={1}
        className='c-book-types ml-1'
      >
        {icons}
      </CleanList>
    </div>
  );
};

BookTypesRow.displayName = 'BookTypesRow';
