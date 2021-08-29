import {APIRecord} from '@api/APIRecord';
import {ImageVersionedRecord} from './ImageAttachment.record';

export enum BrochurePageKind {
  EMPTY = 'EMPTY',
  IMAGE = 'IMAGE',
}

export interface BrochurePageRecord extends APIRecord {
  index: number;
  image: ImageVersionedRecord;
  kind?: BrochurePageKind,
}
