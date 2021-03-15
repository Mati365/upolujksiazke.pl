export class ImageAttachmentRecord {
  ratio: number;
  nsfw: boolean;
  file: string;
}

export type ImageVersionField = 'smallTumb'|'thumb'|'preview'|'big';

export type ImageVersionedRecord = Record<ImageVersionField, ImageAttachmentRecord>;
