import {APIRecord} from '../APIRecord';

export interface BookAuthorRecord extends APIRecord {
  name: string;
  parameterizedName: string;
  description?: string;
}
