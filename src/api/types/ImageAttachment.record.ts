export class ImageAttachmentRecord {
  ratio: number;
  nsfw: boolean;
  file: string;
}

export type ImageVersionedRecord = Record<'smallTumb'|'thumb'|'preview'|'big', ImageAttachmentRecord>;
