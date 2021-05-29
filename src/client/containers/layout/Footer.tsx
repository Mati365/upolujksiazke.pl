import React from 'react';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';

import {ENV} from '@client/constants/env';
import {
  HOME_PATH,
  BOOKS_PATH,
  AUTHORS_PATH,
  BOOK_SERIES_PATH,
  TOP_BOOKS_PATH,
  BookCategoryLink,
} from '@client/routes/Links';

import {BookCategoryRecord} from '@api/types';
import {WebsiteLogoIcon} from '@client/components/svg';
import {
  Container, Divider, Grid,
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
    [BOOKS_PATH, t('links.books')],
    [AUTHORS_PATH, t('links.authors')],
    [BOOK_SERIES_PATH, t('links.series')],
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
              {R.take(9, popularCategories || []).map(
                (category) => (
                  <BookCategoryLink
                    key={category.id}
                    item={category}
                  >
                    {category.name}
                  </BookCategoryLink>
                ),
              )}
            </Grid>
          </div>

          <div className='c-footer__column'>
            <UnderlinedTitle tag='h3'>
              {t('footer.about')}
            </UnderlinedTitle>

            <div className='c-footer__logo c-flex-row'>
              <WebsiteLogoIcon />
              <span className='ml-1'>
                {ENV.shared.website.name}
              </span>
            </div>

            <div className='c-footer__about'>
              {t('about.description')}
            </div>
          </div>
        </Grid>

        <Divider />

        <div className='c-footer__copyright'>
          {t('about.copyright', [new Date().getFullYear()])}
        </div>
      </Container>
    </footer>
  );
};

Footer.displayName = 'Footer';
