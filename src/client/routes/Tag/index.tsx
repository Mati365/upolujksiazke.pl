import React from 'react';
import {Redirect} from 'react-router';

import {capitalize, objPropsToPromise} from '@shared/helpers';
import {serializeAggsToSearchParams} from '@client/containers/kinds/book/filters/helpers/serializeAggsToSearchParams';
import {deserializeUrlFilters} from '@client/containers/filters/hooks/useStoreFiltersInURL';

import {useI18n} from '@client/i18n';

import {
  BooksFiltersContainer,
  getDefaultBooksFilters,
} from '@client/containers/kinds/book/filters/BooksFiltersContainer';

import {
  BooksFiltersWithNames,
  BooksPaginationResultWithAggs,
} from '@api/repo';

import {TagRecord} from '@api/types';
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
  HOME_PATH,
  TAG_PATH,
  genTagLink,
  genBooksLink,
} from '../Links';

type TagRouteData = {
  layoutData: LayoutViewData,
  tag: TagRecord,
  initialBooks: BooksPaginationResultWithAggs,
  initialFilters: any,
};

export const TagRoute: AsyncRoute<TagRouteData> = (
  {
    tag,
    layoutData,
    initialBooks,
    initialFilters,
  },
) => {
  const t = useI18n('routes.tag');

  if (!tag)
    return <Redirect to={HOME_PATH} />;

  const capitalizedName = capitalize(tag.name);
  const breadcrumbs = (
    <Breadcrumbs
      items={[
        {
          id: 'books',
          path: genBooksLink(),
          title: t('shared.breadcrumbs.books'),
        },
        {
          id: 'tag',
          path: genTagLink(tag),
          title: capitalizedName,
        },
      ]}
    />
  );

  return (
    <Layout {...layoutData}>
      <SEOMeta
        meta={{
          title: t('seo.title', [tag.name]),
          description: t('seo.description', [tag.name]),
          cover: initialBooks[0]?.primaryRelease.cover.preview?.file,
        }}
      />

      <Container className='c-tag-route'>
        <BooksFiltersContainer
          initialBooks={initialBooks}
          initialFilters={initialFilters}
          overrideFilters={{
            tagsIds: [tag.id],
          }}
          contentHeader={
            ({searchInput}) => (
              <>
                {breadcrumbs}
                <LayoutHeaderTitle
                  margin='medium'
                  toolbar={searchInput}
                >
                  {t('books.title', [capitalizedName])}
                </LayoutHeaderTitle>
              </>
            )
          }
        />
      </Container>
    </Layout>
  );
};

TagRoute.displayName = 'TagRoute';

TagRoute.route = {
  path: TAG_PATH,
  exact: true,
};

TagRoute.getInitialProps = async (attrs) => {
  const {
    search,
    api: {repo},
    match: {params},
  } = attrs;

  const initialFilters: BooksFiltersWithNames = {
    ...getDefaultBooksFilters(),
    ...deserializeUrlFilters(search),
  };

  const {
    layoutData,
    tag,
    initialBooks,
  } = await objPropsToPromise(
    {
      layoutData: Layout.getInitialProps(attrs),
      tag: repo.tags.findOne(params.id),
      initialBooks: repo.books.findAggregatedBooks(
        {
          ...serializeAggsToSearchParams(initialFilters),
          tagsIds: [params.id],
        },
      ),
    },
  );

  return {
    layoutData,
    tag,
    initialBooks,
    initialFilters,
  } as TagRouteData;
};
