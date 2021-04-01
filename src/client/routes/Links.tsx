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

export const AUTHOR_PATH = '/autor/:slug,:id';
export const AuthorLink = UndecoratedLink.create<Pick<BookAuthorRecord, 'parameterizedName'|'id'>>(
  ({id, parameterizedName}) => `/autor/${parameterizedName},${id}`,
);

export const CATEGORY_PATH = '/kategoria/:slug,:id';
export const CategoryLink = UndecoratedLink.create<Pick<BookCategoryRecord, 'parameterizedName'|'id'>>(
  ({id, parameterizedName}) => `/kategoria/${parameterizedName},${id}`,
);

export const TAG_PATH = '/tag/:slug,:id';
export const genTagLink = (
  {
    id,
    parameterizedName,
  }: Pick<TagRecord, 'parameterizedName'|'id'>,
) => `/tag/${parameterizedName},${id}`;

export const TagLink = UndecoratedLink.create<Pick<TagRecord, 'parameterizedName'|'id'>>(genTagLink);
