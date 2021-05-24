import React from 'react';

import {ENV} from '@client/constants/env';

import {capitalize} from '@shared/helpers';
import {useI18n} from '@client/i18n';

import {DynamicIcon} from '@client/components/svg';
import {BookCategoryRecord} from '@api/types';
import {BacklinksList, BacklinkTitledGroup} from '@client/containers/filters';
import {
  BookCategoryLink,
  BooksLink,
  HomeLink,
} from '@client/routes/Links';

type BooksBacklinksProps = {
  withAllBooksLink?: boolean,
  currentCategory?: BookCategoryRecord,
  categories?: BookCategoryRecord[],
};

export const BooksBacklinks = (
  {
    withAllBooksLink = true,
    categories,
    currentCategory,
  }: BooksBacklinksProps,
) => {
  const t = useI18n();
  const renderBookCategory = (category: BookCategoryRecord) => (
    <BookCategoryLink
      item={category}
      className='c-filters-backlink-group__icon-link'
    >
      <DynamicIcon icon={category.icon} />
      <span>
        {capitalize(category.name)}
      </span>
    </BookCategoryLink>
  );

  return (
    <>
      <BacklinkTitledGroup>
        <HomeLink>
          {ENV.shared.website.name}
        </HomeLink>
      </BacklinkTitledGroup>

      {withAllBooksLink && (
        <BacklinkTitledGroup>
          <BooksLink>
            {t('links.books')}
          </BooksLink>
        </BacklinkTitledGroup>
      )}

      {categories && (
        <BacklinksList
          renderLinkFn={renderBookCategory}
          links={
            categories.filter((category) => category.id !== currentCategory?.id)
          }
          header={
            currentCategory && (
              <li className='is-active'>
                {renderBookCategory(currentCategory)}
              </li>
            )
          }
        />
      )}
    </>
  );
};

BooksBacklinks.displayName = 'BooksBacklinks';
