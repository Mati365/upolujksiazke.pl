import {Expose, Type} from 'class-transformer';

import {SERVER_ENV} from '@server/constants/env';
import {concatUrls} from '@shared/helpers/concatUrls';

import {ImageVersion} from '@shared/enums/imageVersion';
import {ImageVersionedRecord} from '@api/types/ImageAttachment.record';

export class AttachmentDbResult {
  @Expose() file: string;
}

export class ImageAttachmentDbResult {
  @Expose() ratio: number;
  @Expose() nsfw: boolean;
  @Expose() version: ImageVersion;

  @Expose()
  @Type(() => AttachmentDbResult)
  attachment: AttachmentDbResult;
}

/**
 * Transforms array of attachments into hash with version as key
 *
 * @export
 * @param {ImageAttachmentDbResult[]} attachments
 * @returns {ImageVersionedRecord}
 */
export function toImageVersionedRecord(attachments: ImageAttachmentDbResult[]): ImageVersionedRecord {
  if (!attachments)
    return null;

  const grouped = attachments.reduce(
    (acc, {attachment, version, ...props}) => {
      acc[version] = {
        ...props,
        file: concatUrls(SERVER_ENV.cdn.publicUrl, attachment.file),
      };

      return acc;
    },
    {} as ImageVersionedRecord,
  );

  return {
    thumb: grouped[ImageVersion.THUMB],
    preview: grouped[ImageVersion.PREVIEW],
    smallTumb: grouped[ImageVersion.SMALL_THUMB],
    big: grouped[ImageVersion.BIG],
  };
}
