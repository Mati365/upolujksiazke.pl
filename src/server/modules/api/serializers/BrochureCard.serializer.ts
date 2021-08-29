import {Expose, Transform, Type} from 'class-transformer';

import {
  BrochureCardRecord,
  ImageVersionedRecord,
} from '@api/types';

import {BaseDatedSerialized} from './Base.serializer';
import {BrandSerializer} from './Brand.serializer';
import {DurationSerializer} from './Duration.serializer';
import {
  ImageAttachmentDbResult,
  toImageVersionedRecord,
} from './ImageAttachment.serializer';

export class BrochureCardSerializer extends BaseDatedSerialized implements BrochureCardRecord {
  @Expose() title: string;
  @Expose() parameterizedName: string;

  @Expose()
  @Type(() => DurationSerializer)
  valid: DurationSerializer;

  @Expose()
  @Type(() => BrandSerializer)
  brand: BrandSerializer;

  @Expose()
  @Type(() => ImageAttachmentDbResult)
  @Transform(({value}) => toImageVersionedRecord(value))
  cover: ImageVersionedRecord;
}
