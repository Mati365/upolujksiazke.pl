export class ImageAttachmentRecord {
  ratio: number;
  nsfw: boolean;
  file: string;
}

export type ImageVersionField = 'smallThumb' | 'thumb' | 'preview' | 'big';

export const IMAGE_VERSIONS_FIELDS: ImageVersionField[] = ['smallThumb', 'thumb', 'preview', 'big'];

export type ImageVersionedRecord = Record<ImageVersionField, ImageAttachmentRecord>;
