import {APIRecord} from '../APIRecord';
import {ImageVersionedRecord} from './ImageAttachment.record';

export interface BookCardReleaseRecord extends APIRecord {
  cover: ImageVersionedRecord;
}
