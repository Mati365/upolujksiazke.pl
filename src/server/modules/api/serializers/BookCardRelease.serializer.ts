import {Expose, Transform, Type} from 'class-transformer';

import {BookCardReleaseRecord} from '@api/types/BookCardRelease.record';
import {ImageVersionedRecord} from '@api/types/ImageAttachment.record';

import {
  ImageAttachmentDbResult,
  toImageVersionedRecord,
} from './ImageAttachment.serializer';

export class BookCardReleaseSerializer implements BookCardReleaseRecord {
  @Expose() id: number;

  @Expose()
  @Type(() => ImageAttachmentDbResult)
  @Transform(({value}) => toImageVersionedRecord(value))
  cover: ImageVersionedRecord;
}
