import {BookCardRecord} from '@api/types';
import {ContainerLink} from '@client/components/ui';

export const HOME_PATH = '/';
export const HomeLink = ContainerLink.create(HOME_PATH);

export const BOOK_PATH = '/ksiazka/:slug,:id';
export const BookLink = ContainerLink.create<Pick<BookCardRecord, 'parameterizedSlug'|'id'>>(
  ({id, parameterizedSlug}) => `/ksiazka/${parameterizedSlug},${id}`,
);
