import {UndecoratedLink} from '@client/components/ui';
import {BookSchoolLevel} from '@shared/enums';
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

export const BOOKS_PATH = '/ksiazki';
export const BooksLink = UndecoratedLink.create(BOOKS_PATH);

export const BOOK_PATH = '/ksiazka/:slug,:id';
export const BookLink = UndecoratedLink.create<Pick<BookCardRecord, 'parameterizedSlug'|'id'>>(
  ({id, parameterizedSlug}) => `/ksiazka/${parameterizedSlug},${id}`,
);

export const PUBLISHER_PATH = '/wydawca/:slug,:id';
export const PublisherLink = UndecoratedLink.create<Pick<BookPublisherRecord, 'parameterizedName'|'id'>>(
  ({id, parameterizedName}) => `/wydawca/${parameterizedName},${id}`,
);

export const BOOK_ERA_PATH = '/epoka/:slug,:id';
export const BookEraLink = UndecoratedLink.create<Pick<BookEraRecord, 'parameterizedName'|'id'>>(
  ({id, parameterizedName}) => `/wydawca/${parameterizedName},${id}`,
);

export const BOOK_GENRE_PATH = '/gatunek/:slug,:id';
export const BookGenreLink = UndecoratedLink.create<Pick<BookGenreRecord, 'parameterizedName'|'id'>>(
  ({id, parameterizedName}) => `/gatunek/${parameterizedName},${id}`,
);

export const BOOK_SCHOOL_LEVEL_PATH = '/poziom/:slug,:id';
export const BookSchoolLevelLink = UndecoratedLink.create<BookSchoolLevel>((id) => `/poziom-szkolny,${id}`);

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

export const genCategoryLink = (
  {
    id,
    parameterizedName,
  }: Pick<BookCategoryRecord, 'parameterizedName'|'id'>,
) => `/kategoria/${parameterizedName},${id}`;

export const CATEGORY_PATH = '/kategoria/:slug,:id';
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
