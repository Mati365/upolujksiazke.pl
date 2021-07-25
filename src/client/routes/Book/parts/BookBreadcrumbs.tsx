import React from 'react';

import {capitalize} from '@shared/helpers';
import {
  formatBookTitle,
  formatBookVolume,
} from '@client/helpers/logic';

import {useI18n} from '@client/i18n';
import {BreadcrumbInfo, Breadcrumbs} from '@client/containers/kinds/breadcrumbs';
import {BookFullInfoRecord} from '@api/types';
import {
  genBooksLink,
  genBookCategoryLink,
  genBookLink,
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
          path: genBooksLink(),
          node: t('shared.breadcrumbs.books'),
        },
        primaryCategory && {
          id: 'category',
          path: genBookCategoryLink(primaryCategory),
          node: capitalize(primaryCategory.name),
        },
        ...(
          volume?.name !== '1' && hierarchy?.length
            ? [
              {
                id: 'book',
                path: genBookLink(hierarchy[0]),
                node: hierarchy[0].defaultTitle,
              },
              {
                id: 'volume',
                path: genBookLink(book),
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
                path: genBookLink(book),
                node: formatBookTitle(
                  {
                    t,
                    book,
                  },
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
