import {Expose, Transform, Type} from 'class-transformer';

import {ImageVersionedRecord} from '@api/types/ImageAttachment.record';
import {WebsiteRecord} from '@api/types/Website.record';
import {BaseSerializer} from './Base.serializer';
import {
  ImageAttachmentDbResult,
  toImageVersionedRecord,
} from './ImageAttachment.serializer';

export class WebsiteSerializer extends BaseSerializer implements WebsiteRecord {
  @Expose() url: string;
  @Expose() description: string;
  @Expose() title: string;

  @Expose()
  @Type(() => ImageAttachmentDbResult)
  @Transform(({value}) => toImageVersionedRecord(value))
  logo: ImageVersionedRecord;
}
