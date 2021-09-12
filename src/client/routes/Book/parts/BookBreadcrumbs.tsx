import React, {ReactNode} from 'react';

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
  toolbar?: ReactNode,
};

export const BookBreadcrumbs = (
  {
    toolbar,
    book,
    additionalItems = [],
  }: BookBreadcrumbsProps,
) => {
  const t = useI18n('routes.book');
  const {volume, hierarchy, primaryCategory} = book;

  return (
    <Breadcrumbs
      toolbar={toolbar}
      items={[
        {
          id: 'books',
          path: genBooksLink(),
          title: t('shared.breadcrumbs.books'),
        },
        primaryCategory && {
          id: 'category',
          path: genBookCategoryLink(primaryCategory),
          title: capitalize(primaryCategory.name),
        },
        ...(
          volume?.name !== '1' && hierarchy?.length
            ? [
              {
                id: 'book',
                path: genBookLink(hierarchy[0]),
                title: hierarchy[0].defaultTitle,
              },
              {
                id: 'volume',
                path: genBookLink(book),
                title: formatBookVolume(
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
                title: formatBookTitle(
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
