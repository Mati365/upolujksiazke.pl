import {APINamedRecord} from '@api/APIRecord';
import {WebsiteRecord} from './Website.record';
import {ImageVersionedRecord} from './ImageAttachment.record';

export interface BrandRecord extends APINamedRecord {
  logo: ImageVersionedRecord;
  website?: WebsiteRecord;
  description?: string;
}
