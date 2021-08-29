import {APINamedRecord} from '../APIRecord';
import type {BookCardRecord} from './BookCard.record';

export interface BookAuthorRecord extends APINamedRecord {
  description?: string;
}

export type AuthorsBooksRecords = {
  author: BookAuthorRecord,
  books: BookCardRecord[],
}[];
