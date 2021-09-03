import {Expose, Type, Transform} from 'class-transformer';

import {Gender} from '@shared/types';
import {BookReviewerRecord, ImageVersionedRecord} from '@api/types';
import {BaseSerializer} from './Base.serializer';
import {
  ImageAttachmentDbResult,
  toImageVersionedRecord,
} from './ImageAttachment.serializer';

export class BookReviewerSerializer extends BaseSerializer implements BookReviewerRecord {
  @Expose() name: string;
  @Expose() gender: Gender;
  @Expose() hidden: boolean;

  @Expose()
  @Type(() => ImageAttachmentDbResult)
  @Transform(({value}) => toImageVersionedRecord(value))
  avatar: ImageVersionedRecord;
}
