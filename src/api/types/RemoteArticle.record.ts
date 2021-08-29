import {APIRecord} from '../APIRecord';
import {ImageVersionedRecord} from './ImageAttachment.record';
import {WebsiteRecord} from './Website.record';

export interface RemoteArticleRecord extends APIRecord {
  publishDate: Date;
  title: string;
  description: string;
  cover: ImageVersionedRecord;
  url: string;
  website: WebsiteRecord;
}
