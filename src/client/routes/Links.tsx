import {buildURL} from '@shared/helpers';
import {serializeUrlFilters} from '@client/containers/filters/hooks/useStoreFiltersInURL';

import {UndecoratedLink} from '@client/components/ui/Link';
import {BookSchoolLevel} from '@shared/enums';
import {BooksFiltersWithNames} from '@api/repo';
import {
  BookAuthorRecord,
  BookCardRecord,
  BookCategoryRecord,
  BookEraRecord,
  BookGenreRecord,
  BookPublisherRecord,
  TagRecord,
} from '@api/types';

export const HOME_PATH = '/';
export const HomeLink = UndecoratedLink.create(HOME_PATH);

export const NEWS_PATH = '/aktualnosci';
export const NewsLink = UndecoratedLink.create(NEWS_PATH);

export const BOOKS_PATH = '/ksiazki';
export const genBooksLink = (filters: BooksFiltersWithNames) => buildURL(
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
    root,
    parameterizedName,
  }: BookCategoryRecord,
) => (
  root === false
    ? genBooksLink(
      {
        categories: [
          {
            id,
            name,
          },
        ],
      },
    )
    : `/kategoria/${parameterizedName},${id}`
);

export const BOOKS_CATEGORY_PATH = '/kategoria/:slug,:id';
export const BookCategoryLink = UndecoratedLink.create<Parameters<typeof genBookCategoryLink>[0]>(genBookCategoryLink);

export const BOOK_PATH = '/ksiazka/:slug,:id';
export const BookLink = UndecoratedLink.create<Pick<BookCardRecord, 'parameterizedSlug' | 'id'>>(
  ({id, parameterizedSlug}) => `/ksiazka/${parameterizedSlug},${id}`,
);

export const BOOK_ALL_REVIEWS_PATH = `${BOOK_PATH}/recenzje`;
export const BookAllReviewsLink = UndecoratedLink.create<Pick<BookCardRecord, 'parameterizedSlug' | 'id'>>(
  ({id, parameterizedSlug}) => `/ksiazka/${parameterizedSlug},${id}/recenzje`,
);

export const PUBLISHER_PATH = '/wydawca/:slug,:id';
export const PublisherLink = UndecoratedLink.create<Pick<BookPublisherRecord, 'parameterizedName' | 'id'>>(
  ({id, parameterizedName}) => `/wydawca/${parameterizedName},${id}`,
);

export const BOOK_ERA_PATH = '/epoka/:slug,:id';
export const BookEraLink = UndecoratedLink.create<Pick<BookEraRecord, 'parameterizedName' | 'id'>>(
  ({id, parameterizedName}) => `/epoka/${parameterizedName},${id}`,
);

export const BOOK_GENRE_PATH = '/gatunek/:slug,:id';
export const BookGenreLink = UndecoratedLink.create<Pick<BookGenreRecord, 'parameterizedName' | 'id'>>(
  ({id, parameterizedName}) => `/gatunek/${parameterizedName},${id}`,
);

export const BOOK_SCHOOL_LEVEL_PATH = '/poziom/:slug,:id';
export const BookSchoolLevelLink = UndecoratedLink.create<BookSchoolLevel>((id) => `/poziom-szkolny,${id}`);

export const BOOK_SERIES_PATH = '/serie-ksiazek';
export const BookSeriesLink = UndecoratedLink.create(BOOK_SERIES_PATH);

export const TOP_BOOKS_PATH = '/top-ksiazki';
export const TopBooksLink = UndecoratedLink.create(TOP_BOOKS_PATH);

export const AUTHOR_PATH = '/autor/:slug,:id';
export const AUTHORS_PATH = '/autorzy/:letter?';

export const genAuthorsLink = (letter?: string) => `/autorzy${(letter ? `/${letter}` : '')}`;
export const AuthorsLink = UndecoratedLink.create<string>(genAuthorsLink);

export const AuthorLink = UndecoratedLink.create<Pick<BookAuthorRecord, 'parameterizedName' | 'id'>>(
  ({id, parameterizedName}) => `/autor/${parameterizedName},${id}`,
);

export const TAG_PATH = '/tag/:slug,:id';

export const genTagLink = (
  {
    id,
    parameterizedName,
  }: Pick<TagRecord, 'parameterizedName' | 'id'>,
) => `/tag/${parameterizedName},${id}`;

export const TagLink = UndecoratedLink.create<Parameters<typeof genTagLink>[0]>(genTagLink);
