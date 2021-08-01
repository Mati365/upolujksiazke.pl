import {ENV} from '@client/constants/env';

import {buildURL, concatUrls, parameterize} from '@shared/helpers';
import {serializeUrlFilters} from '@client/containers/filters/hooks/useStoreFiltersInURL';

import {UndecoratedLink} from '@client/components/ui/Link';
import {BookSchoolLevel} from '@shared/enums';
import {BooksFiltersWithNames} from '@api/repo';
import {TagRecord} from '@api/types';

export type IdNameLinkPair = {
  name?: string,
  parameterizedName?: string,
  id: any,
};

export type IdSlugBookPair = {
  parameterizedSlug: string,
  id: any,
};

export const prefixLinkWithHost = (url: string) => concatUrls(ENV.shared.website.url, url);

export const HOME_PATH = '/';
export const HomeLink = UndecoratedLink.create(HOME_PATH);

export const NEWS_PATH = '/aktualnosci';
export const NewsLink = UndecoratedLink.create(NEWS_PATH);
export const genNewsLink = () => NEWS_PATH;

export const BOOKS_PATH = '/ksiazki';
export const genBooksLink = (filters?: BooksFiltersWithNames) => buildURL(
  BOOKS_PATH,
  serializeUrlFilters(filters),
);

export const BooksLink = UndecoratedLink.create<BooksFiltersWithNames>(genBooksLink);

export const genBooksSearchLink = (searchParams: any) => buildURL(
  BOOKS_PATH,
  serializeUrlFilters(searchParams),
);

export const genBookCategoryLink = (
  {
    id,
    name,
    parameterizedName,
  }: IdNameLinkPair,
) => (
  `/kategoria/${parameterizedName ?? (name && parameterize(name))},${id}`
);

export const BOOKS_CATEGORY_PATH = '/kategoria/:slug,:id';
export const BookCategoryLink = UndecoratedLink.create<IdNameLinkPair>(genBookCategoryLink);

export const BOOK_PATH = '/ksiazka/:slug,:id';
export const genBookLink = ({id, parameterizedSlug}: IdSlugBookPair) => `/ksiazka/${parameterizedSlug},${id}`;
export const BookLink = UndecoratedLink.create<IdSlugBookPair>(genBookLink);

export const BOOK_ALL_REVIEWS_PATH = `${BOOK_PATH}/recenzje`;
export const genAllBookReviewsLink = (attrs: IdSlugBookPair) => `${genBookLink(attrs)}/recenzje`;
export const BookAllReviewsLink = UndecoratedLink.create(genAllBookReviewsLink);

export const PublisherLink = UndecoratedLink.create<IdNameLinkPair>(
  ({id, name}) => genBooksSearchLink(
    {
      publishers: [
        {
          id,
          name,
        },
      ],
    },
  ),
);

export const BOOK_ERA_PATH = '/epoka/:slug,:id';
export const BookEraLink = UndecoratedLink.create<IdNameLinkPair>(
  ({id, parameterizedName}) => `/epoka/${parameterizedName},${id}`,
);

export const BOOK_GENRE_PATH = '/gatunek/:slug,:id';
export const BookGenreLink = UndecoratedLink.create<IdNameLinkPair>(
  ({id, parameterizedName}) => `/gatunek/${parameterizedName},${id}`,
);

export const BOOK_SCHOOL_LEVEL_PATH = '/poziom/:slug,:id';
export const BookSchoolLevelLink = UndecoratedLink.create<BookSchoolLevel>((id) => `/poziom-szkolny,${id}`);

export const BOOKS_REVIEWS_PATH = '/opinie';
export const BooksReviewsLink = UndecoratedLink.create(BOOKS_REVIEWS_PATH);
export const genAllBooksReviewsLink = () => BOOKS_REVIEWS_PATH;

export const TOP_BOOKS_PATH = '/top-ksiazki';
export const TopBooksLink = UndecoratedLink.create(TOP_BOOKS_PATH);
export const genTopBooksLink = () => TOP_BOOKS_PATH;

export const AUTHORS_PATH = '/autorzy/:letter?';
export const genAuthorsLink = (letter?: string) => `/autorzy${(letter ? `/${letter}` : '')}`;
export const AuthorsLink = UndecoratedLink.create<string>(genAuthorsLink);

export const AUTHOR_PATH = '/autor/:slug,:id';
export const genAuthorLink = ({id, parameterizedName}: IdNameLinkPair) => `/autor/${parameterizedName},${id}`;
export const AuthorLink = UndecoratedLink.create<IdNameLinkPair>(genAuthorLink);

export const TAG_PATH = '/tag/:slug,:id';
export const genTagLink = (
  {
    id,
    parameterizedName,
  }: Pick<TagRecord, 'parameterizedName' | 'id'>,
) => `/tag/${parameterizedName},${id}`;

export const TagLink = UndecoratedLink.create<Parameters<typeof genTagLink>[0]>(genTagLink);
