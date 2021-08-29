import {APIRecord} from '../APIRecord';

export interface BookSummaryHeaderRecord extends APIRecord {
  title: string;
  parameterizedTitle: string;
  url: string;
}
