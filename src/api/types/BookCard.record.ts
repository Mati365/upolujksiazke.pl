import {APIRecord} from '../APIRecord';
import {BookAuthorRecord} from './BookAuthor.record';
import {BookCardReleaseRecord} from './BookCardRelease.record';

export interface BookCardRecord extends APIRecord {
  parameterizedSlug: string;
  authors: BookAuthorRecord[];
  primaryRelease: BookCardReleaseRecord,
}
