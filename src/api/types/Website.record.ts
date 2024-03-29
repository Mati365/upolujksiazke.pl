import {APIRecord} from '../APIRecord';
import {ImageVersionedRecord} from './ImageAttachment.record';

export interface WebsiteRecord extends APIRecord {
  url: string;
  description: string;
  title: string;
  hostname: string;
  shop: boolean;
  logo: ImageVersionedRecord;
}
