import React from 'react';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';

import {BookFullInfoRecord} from '@api/types';
import {
  BookEraLink,
  BookGenreLink,
  BookSchoolLevelLink,
} from '@client/routes/Links';

import {
  KeyValueTable,
  KeyValueTableProps,
  LinksRow,
} from '@client/components/ui';

type BookSchoolInfoProps = {
  book: BookFullInfoRecord,
};

export const BookSchoolInfo = ({book}: BookSchoolInfoProps) => {
  const t = useI18n('shared.book.props');
  const {schoolBook, era, genre} = book;

  return (
    <KeyValueTable
      className='c-book-school-info is-text-small'
      items={[
        era?.length && [
          `${t('era')}:`,
          <LinksRow
            items={era}
            linkComponent={BookEraLink}
            linkProps={{
              className: 'is-primary-chevron-link',
            }}
          />,
        ],
        genre?.length && [
          `${t('genre')}:`,
          <LinksRow
            items={genre}
            linkComponent={BookGenreLink}
            linkProps={{
              className: 'is-primary-chevron-link',
            }}
          />,
        ],
        ...!schoolBook ? [] : [
          !R.isNil(schoolBook.classLevel) && [
            `${t('school_level')}:`,
            <BookSchoolLevelLink
              className='is-primary-chevron-link'
              item={schoolBook.classLevel}
            >
              {t(`shared.book.classLevel.${schoolBook.classLevel}`)}
            </BookSchoolLevelLink>,
          ],
          [
            `${t('obligatory')}:`,
            t(`shared.titles.${schoolBook.obligatory ? 'yes' : 'no'}`),
          ],
        ] as KeyValueTableProps['items'],
      ]}
    />
  );
};

BookSchoolInfo.displayName = 'BookSchoolInfo';
