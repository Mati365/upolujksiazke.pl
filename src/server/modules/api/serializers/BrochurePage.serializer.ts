import {Expose, Transform, Type} from 'class-transformer';

import {
  BrochurePageRecord,
  ImageVersionedRecord,
} from '@api/types';

import {BaseDatedSerialized} from './Base.serializer';
import {
  ImageAttachmentDbResult,
  toImageVersionedRecord,
} from './ImageAttachment.serializer';

export class BrochurePageSerializer extends BaseDatedSerialized implements BrochurePageRecord {
  @Expose() index: number;

  @Expose()
  @Type(() => ImageAttachmentDbResult)
  @Transform(({value}) => toImageVersionedRecord(value))
  image: ImageVersionedRecord;
}
