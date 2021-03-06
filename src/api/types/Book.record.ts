import {APIRecord} from '../APIRecord';
import {BookAuthorRecord} from './BookAuthor.record';

export class BookRecord extends APIRecord {
  title: string;
  parameterizedSlug: string;
  authors?: BookAuthorRecord[];
}
