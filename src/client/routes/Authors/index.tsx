import React from 'react';

import {objPropsToPromise} from '@shared/helpers';
import {useI18n} from '@client/i18n';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {BookAuthorRecord} from '@api/types';
import {Breadcrumbs} from '@client/containers/kinds/breadcrumbs';
import {Container} from '@client/components/ui';
import {LettersAuthorsSection} from '@client/containers/kinds/author';
import {
  Layout,
  LayoutHeaderTitle,
  LayoutViewData,
  SEOMeta,
} from '@client/containers/layout';

import {
  AUTHORS_PATH,
  genBooksLink,
  genAuthorsLink,
} from '../Links';

type AuthorsRouteData = {
  layoutData: LayoutViewData,
  letter: {
    current: string,
    authorsLetters: string[],
    authors: BookAuthorRecord[],
  },
};

export const AuthorsRoute: AsyncRoute<AuthorsRouteData> = (
  {
    layoutData,
    letter,
  },
) => {
  const t = useI18n('routes.authors');
  const decodedLetter = decodeURIComponent(letter.current);

  return (
    <Layout {...layoutData}>
      <SEOMeta
        meta={{
          title: t('seo.title', [decodedLetter]),
          description: t('seo.description', [decodedLetter]),
        }}
      />

      <Container className='c-authors-route'>
        <Breadcrumbs
          items={[
            {
              id: 'books',
              path: genBooksLink(),
              title: t('shared.breadcrumbs.books'),
            },
            {
              id: 'authors',
              path: genAuthorsLink(),
              title: t('shared.breadcrumbs.authors'),
            },
          ]}
        />

        <LayoutHeaderTitle>
          {t('title', [letter.current])}
        </LayoutHeaderTitle>

        <LettersAuthorsSection
          letter={letter.current}
          letters={letter.authorsLetters}
          authors={letter.authors}
        />
      </Container>
    </Layout>
  );
};

AuthorsRoute.displayName = 'AuthorsRoute';

AuthorsRoute.route = {
  path: AUTHORS_PATH,
  exact: true,
};

AuthorsRoute.getInitialProps = async (attrs) => {
  const {
    api: {repo},
    match: {
      params: {
        letter = 'A',
      },
    },
  } = attrs;

  const {
    layoutData,
    authors,
    firstAuthorsLetters,
  } = await objPropsToPromise(
    {
      layoutData: Layout.getInitialProps(attrs),
      firstAuthorsLetters: repo.authors.findAuthorsFirstNamesLetters(),
      authors: repo.authors.findAll(
        {
          firstLetters: [
            decodeURIComponent(letter),
          ],
        },
      ),
    },
  );

  return {
    layoutData,
    letter: {
      current: letter,
      authorsLetters: firstAuthorsLetters,
      authors: authors.items,
    },
  } as AuthorsRouteData;
};
