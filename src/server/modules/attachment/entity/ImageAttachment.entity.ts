import {
  Column, Entity, // AfterRemove,
  JoinColumn, OneToOne, RelationId,
} from 'typeorm';

import {DatedRecordEntity} from '../../database/DatedRecord.entity';
import {CreateImageAttachmentDto} from '../dto/CreateImageAttachment.dto';
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

  @OneToOne(
    () => AttachmentEntity,
    {
      onDelete: 'CASCADE',
      cascade: true,
    },
  )
  @JoinColumn()
  attachment: AttachmentEntity;

  @Column()
  @RelationId((entity: ImageAttachmentEntity) => entity.attachment)
  attachmentId: number;

  constructor(partial: Partial<ImageAttachmentEntity>) {
    super();
    Object.assign(this, partial);
  }

  static fromDTO({nsfw, ratio, version, ...attachment}: CreateImageAttachmentDto) {
    return new ImageAttachmentEntity(
      {
        nsfw,
        ratio,
        version,
        attachment: AttachmentEntity.fromDTO(attachment),
      },
    );
  }
}
