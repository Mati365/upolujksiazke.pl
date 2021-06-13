import React from 'react';

import {capitalize} from '@shared/helpers';
import {
  formatBookTitle,
  formatBookVolume,
} from '@client/helpers/logic';

import {useI18n} from '@client/i18n';
import {BreadcrumbInfo, Breadcrumbs} from '@client/containers/Breadcrumbs';
import {BookFullInfoRecord} from '@api/types';
import {
  BookLink,
  BooksLink,
  BookCategoryLink,
} from '../../Links';

type BookBreadcrumbsProps = {
  book: BookFullInfoRecord,
  additionalItems?: BreadcrumbInfo[],
};

export const BookBreadcrumbs = (
  {
    book,
    additionalItems = [],
  }: BookBreadcrumbsProps,
) => {
  const t = useI18n('routes.book');
  const {volume, hierarchy, primaryCategory} = book;

  return (
    <Breadcrumbs
      items={[
        {
          id: 'books',
          node: (
            <BooksLink>
              {t('shared.breadcrumbs.books')}
            </BooksLink>
          ),
        },
        primaryCategory && {
          id: 'category',
          node: (
            <BookCategoryLink item={primaryCategory}>
              {capitalize(primaryCategory.name)}
            </BookCategoryLink>
          ),
        },
        ...(
          volume?.name !== '1' && hierarchy?.length
            ? [
              {
                id: 'book',
                node: (
                  <BookLink item={hierarchy[0]}>
                    {hierarchy[0].defaultTitle}
                  </BookLink>
                ),
              },
              {
                id: 'volume',
                node: formatBookVolume(
                  {
                    t,
                    volume,
                  },
                ),
              },
            ]
            : [
              {
                id: 'book',
                node: (
                  <BookLink item={book}>
                    {formatBookTitle(
                      {
                        t,
                        book,
                      },
                    )}
                  </BookLink>
                ),
              },
            ]
        ),
        ...additionalItems,
      ].filter(Boolean)}
    />
  );
};

BookBreadcrumbs.displayName = 'BookBreadcrumbs';
