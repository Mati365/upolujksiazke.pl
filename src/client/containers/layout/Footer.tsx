import React from 'react';

import {useI18n} from '@client/i18n';

import {
  HOME_PATH,
  CATEGORIES_PATH,
  AUTHORS_PATH,
  BOOK_SERIES_PATH,
  TAGS_PATH,
  TOP_BOOKS_PATH,
  CategoryLink,
} from '@client/routes/Links';

import {BookCategoryRecord} from '@api/types';
import {
  Container, Grid,
  UndecoratedLink, UnderlinedTitle,
} from '@client/components/ui';

type FooterProps = {
  popularCategories: BookCategoryRecord[],
};

const FooterOutlineAnchor = ({href, title}) => (
  <UndecoratedLink
    className='c-footer__link-btn'
    href={href}
    title={title}
  >
    {title}
  </UndecoratedLink>
);

export const Footer = ({popularCategories}: FooterProps) => {
  const t = useI18n();
  const shortcuts = [
    [HOME_PATH, t('links.home')],
    [CATEGORIES_PATH, t('links.categories')],
    [AUTHORS_PATH, t('links.authors')],
    [BOOK_SERIES_PATH, t('links.series')],
    [TAGS_PATH, t('links.tags')],
    [TOP_BOOKS_PATH, t('links.top')],
  ];

  return (
    <footer className='c-footer'>
      <Container>
        <Grid
          columns={{
            xs: 1,
            default: 3,
          }}
          gap={10}
        >
          <div className='c-footer__column'>
            <UnderlinedTitle tag='h3'>
              {t('footer.shortcuts')}
            </UnderlinedTitle>

            <Grid
              columns={{
                xs: 2,
                default: 3,
              }}
              gap={3}
            >
              {shortcuts.map(
                ([url, title]) => (
                  <FooterOutlineAnchor
                    key={title}
                    href={url}
                    title={title}
                  />
                ),
              )}
            </Grid>
          </div>

          <div className='c-footer__column'>
            <UnderlinedTitle tag='h3'>
              {t('footer.categories')}
            </UnderlinedTitle>

            <Grid
              columns={{
                xs: 2,
                default: 3,
              }}
              gap={3}
            >
              {popularCategories?.map(
                (category) => (
                  <CategoryLink
                    key={category.id}
                    item={category}
                  >
                    {category.name}
                  </CategoryLink>
                ),
              )}
            </Grid>
          </div>
        </Grid>
      </Container>
    </footer>
  );
};

Footer.displayName = 'Footer';
