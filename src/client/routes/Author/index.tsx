import React from 'react';
import {Redirect} from 'react-router-dom';

import {objPropsToPromise} from '@shared/helpers';
import {serializeAggsToSearchParams} from '@client/containers/kinds/book/filters/helpers/serializeAggsToSearchParams';
import {deserializeUrlFilters} from '@client/containers/filters/hooks/useStoreFiltersInURL';
import {getMetaBookCoverAttrs} from '@client/containers/kinds/book/helpers';

import {useI18n} from '@client/i18n';

import {BookAuthorRecord} from '@api/types';
import {
  BooksFiltersWithNames,
  BooksPaginationResultWithAggs,
} from '@api/repo';

import {
  BooksFiltersContainer,
  getDefaultBooksFilters,
} from '@client/containers/kinds/book/filters/BooksFiltersContainer';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {Breadcrumbs} from '@client/containers/kinds/breadcrumbs';
import {Container} from '@client/components/ui';
import {
  Layout,
  LayoutHeaderTitle,
  LayoutViewData,
  SEOMeta,
} from '@client/containers/layout';

import {
  genBooksLink,
  genAuthorLink,
  genAuthorsLink,
  AUTHOR_PATH,
} from '../Links';

type AuthorRouteData = {
  layoutData: LayoutViewData,
  author: BookAuthorRecord,
  initialBooks: BooksPaginationResultWithAggs,
  initialFilters: any,
};

export const AuthorRoute: AsyncRoute<AuthorRouteData> = (
  {
    layoutData,
    author,
    initialBooks,
    initialFilters,
  },
) => {
  const t = useI18n('routes.author');
  if (!author)
    return <Redirect to={genAuthorsLink()} />;

  const breadcrumbs = (
    <Breadcrumbs
      padding='medium'
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
        {
          id: 'author',
          path: genAuthorLink(author),
          title: author.name,
        },
      ]}
    />
  );

  return (
    <Layout {...layoutData}>
      <SEOMeta
        meta={{
          title: t('seo.title', [author.name]),
          description: t('seo.description', [author.name]),
          cover: getMetaBookCoverAttrs(initialBooks.items[0]?.primaryRelease),
        }}
      />

      <Container className='c-author-route'>
        <BooksFiltersContainer
          initialBooks={initialBooks}
          initialFilters={initialFilters}
          overrideFilters={{
            authors: [author],
          }}
          contentHeader={
            ({searchInput}) => (
              <>
                {breadcrumbs}
                <LayoutHeaderTitle
                  margin='medium'
                  toolbar={searchInput}
                >
                  {t('title', [author.name])}
                </LayoutHeaderTitle>
              </>
            )
          }
        />
      </Container>
    </Layout>
  );
};

AuthorRoute.displayName = 'AuthorRoute';

AuthorRoute.route = {
  path: AUTHOR_PATH,
};

AuthorRoute.getInitialProps = async (attrs) => {
  const {
    search,
    api: {repo},
    match: {
      params: {id},
    },
  } = attrs;

  const initialFilters: BooksFiltersWithNames = {
    ...getDefaultBooksFilters(),
    ...deserializeUrlFilters(search),
  };

  const {
    layoutData,
    author,
    initialBooks,
  } = await objPropsToPromise(
    {
      layoutData: Layout.getInitialProps(attrs),
      author: repo.authors.findOne(id),
      initialBooks: repo.books.findAggregatedBooks(
        {
          ...serializeAggsToSearchParams(initialFilters),
          authorsIds: [id],
        },
      ),
    },
  );

  return {
    layoutData,
    author,
    initialBooks,
    initialFilters,
  } as AuthorRouteData;
};
