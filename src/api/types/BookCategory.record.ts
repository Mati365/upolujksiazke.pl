import {APINamedRecord} from '../APIRecord';

export interface BookCategoryRecord extends APINamedRecord {
  icon?: string;
  root?: boolean;
  parentCategory?: BookCategoryRecord;
}
