import {Expose, Type, Transform} from 'class-transformer';

import {
  RemoteArticleRecord,
  ImageVersionedRecord,
} from '@api/types';

import {BaseSerializer} from './Base.serializer';
import {WebsiteSerializer} from './Website.serializer';
import {
  ImageAttachmentDbResult,
  toImageVersionedRecord,
} from './ImageAttachment.serializer';

export class RemoteArticleSerializer extends BaseSerializer implements RemoteArticleRecord {
  @Expose() title: string;
  @Expose() description: string;
  @Expose() publishDate: Date;
  @Expose() url: string;

  @Expose()
  @Type(() => ImageAttachmentDbResult)
  @Transform(({value}) => toImageVersionedRecord(value))
  cover: ImageVersionedRecord;

  @Expose()
  @Type(() => WebsiteSerializer)
  website: WebsiteSerializer;
}
