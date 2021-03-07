import {APIRecord} from '../APIRecord';

export interface BookCategoryRecord extends APIRecord {
  name: string;
  parameterizedName: string;
}
