import {APIRecord} from '../APIRecord';
import {ImageVersionedRecord} from './ImageAttachment.record';

export interface RemoteArticleRecord extends APIRecord {
  publishDate: Date;
  title: string;
  description: string;
  cover: ImageVersionedRecord;
}
