import {APIRecord} from '../APIRecord';
import {BrandRecord} from './Brand.record';
import {DurationRecord} from './Duration.record';
import {ImageVersionedRecord} from './ImageAttachment.record';

export interface BrochureCardRecord extends APIRecord {
  title: string;
  parameterizedName: string;
  valid: DurationRecord;
  brand: BrandRecord;
  cover: ImageVersionedRecord;
}
