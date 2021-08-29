import {Expose, Transform, Type} from 'class-transformer';

import {
  BrandRecord,
  ImageVersionedRecord,
} from '@api/types';

import {WebsiteSerializer} from './Website.serializer';
import {BaseDatedSerialized} from './Base.serializer';
import {
  ImageAttachmentDbResult,
  toImageVersionedRecord,
} from './ImageAttachment.serializer';

export class BrandSerializer extends BaseDatedSerialized implements BrandRecord {
  @Expose() name: string;
  @Expose() parameterizedName: string;
  @Expose() description: string;

  @Expose()
  @Type(() => WebsiteSerializer)
  website: WebsiteSerializer;

  @Expose()
  @Type(() => ImageAttachmentDbResult)
  @Transform(({value}) => toImageVersionedRecord(value))
  logo: ImageVersionedRecord;
}
