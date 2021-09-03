import {Gender} from '@shared/types';
import {APIRecord} from '../APIRecord';
import {ImageVersionedRecord} from './ImageAttachment.record';

export interface BookReviewerRecord extends APIRecord {
  name: string;
  gender: Gender;
  avatar: ImageVersionedRecord;
  hidden: boolean;
}
