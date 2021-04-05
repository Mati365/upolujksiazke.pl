import {UndecoratedLink} from '@client/components/ui';
import {
  BookAuthorRecord,
  BookCardRecord,
  BookCategoryRecord,
  BookPublisherRecord,
  TagRecord,
} from '@api/types';

export const HOME_PATH = '/';
export const HomeLink = UndecoratedLink.create(HOME_PATH);

export const BOOK_PATH = '/ksiazka/:slug,:id';
export const BookLink = UndecoratedLink.create<Pick<BookCardRecord, 'parameterizedSlug'|'id'>>(
  ({id, parameterizedSlug}) => `/ksiazka/${parameterizedSlug},${id}`,
);

export const PUBLISHER_PATH = '/wydawca/:slug,:id';
export const PublisherLink = UndecoratedLink.create<Pick<BookPublisherRecord, 'parameterizedName'|'id'>>(
  ({id, parameterizedName}) => `/wydawca/${parameterizedName},${id}`,
);

export const BOOK_SERIES_PATH = '/serie-ksiazek';
export const BookSeriesLink = UndecoratedLink.create(BOOK_SERIES_PATH);

export const TOP_BOOKS_PATH = '/top-ksiazki';
export const TopBooksLink = UndecoratedLink.create(TOP_BOOKS_PATH);

export const AUTHOR_PATH = '/autor/:slug,:id';
export const AUTHORS_PATH = '/autorzy';

export const AuthorsLink = UndecoratedLink.create(AUTHORS_PATH);
export const AuthorLink = UndecoratedLink.create<Pick<BookAuthorRecord, 'parameterizedName'|'id'>>(
  ({id, parameterizedName}) => `/autor/${parameterizedName},${id}`,
);

export const CATEGORY_PATH = '/kategoria/:slug,:id';
export const CATEGORIES_PATH = '/kategorie';

export const genCategoryLink = (
  {
    id,
    parameterizedName,
  }: Pick<BookCategoryRecord, 'parameterizedName'|'id'>,
) => `/kategoria/${parameterizedName},${id}`;

export const CategoriesLink = UndecoratedLink.create(CATEGORIES_PATH);
export const CategoryLink = UndecoratedLink.create<Parameters<typeof genCategoryLink>[0]>(genCategoryLink);

export const TAG_PATH = '/tag/:slug,:id';
export const TAGS_PATH = '/tagi';

export const TagsLink = UndecoratedLink.create(TAGS_PATH);
export const genTagLink = (
  {
    id,
    parameterizedName,
  }: Pick<TagRecord, 'parameterizedName'|'id'>,
) => `/tag/${parameterizedName},${id}`;

export const TagLink = UndecoratedLink.create<Parameters<typeof genTagLink>[0]>(genTagLink);
