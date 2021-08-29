import {APIRecord} from '../APIRecord';

export interface BookPublisherRecord extends APIRecord {
  name: string;
  parameterizedName: string;
  websiteURL?: string;
  description?: string;
  address?: string;
}
