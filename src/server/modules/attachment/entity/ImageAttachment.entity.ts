import {Column, Entity, JoinColumn, OneToOne, RelationId} from 'typeorm';
import {DatedRecordEntity} from '../../database/DatedRecord.entity';
import {AttachmentEntity} from './Attachment.entity';

export enum ImageVersion {
  SMALL_THUMB = 'SMALL_THUMB',
  THUMB = 'THUMB',
  PREVIEW = 'PREVIEW',
  BIG = 'BIG',
}

@Entity('image_attachments')
export class ImageAttachmentEntity extends DatedRecordEntity {
  @Column(
    {
      type: 'enum',
      enum: ImageVersion,
    },
  )
  version: ImageVersion;

  @Column('boolean', {default: false})
  nsfw: boolean;

  @Column('float', {nullable: true})
  ratio: number;

  @OneToOne(() => AttachmentEntity, {onDelete: 'CASCADE'})
  @JoinColumn()
  attachment: AttachmentEntity;

  @Column()
  @RelationId((entity: ImageAttachmentEntity) => entity.attachment)
  attachmentId: number;

  constructor(partial: Partial<ImageAttachmentEntity>) {
    super();
    Object.assign(this, partial);
  }
}
