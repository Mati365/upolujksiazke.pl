import {BasicAPIPagination} from '@api/APIClient';
import {APIRepo} from '../APIRepo';
import {BookAuthorRecord} from '../types/BookAuthor.record';

export type BooksAuthorsFilters = BasicAPIPagination & {
  firstLetters?: string[],
};

export interface BookAuthorsRepo extends APIRepo<BookAuthorRecord, BooksAuthorsFilters> {
  findAuthorsFirstNamesLetters(): Promise<string[]>;
}
