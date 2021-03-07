import {APIRecord} from '../APIRecord';
import {ImageVersionedRecord} from './ImageAttachment.record';

export interface BookCardReleaseRecord extends APIRecord {
  title: string;
  cover: ImageVersionedRecord;
}
