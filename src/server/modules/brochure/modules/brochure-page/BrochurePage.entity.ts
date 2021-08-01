import {
  Column, JoinTable, ManyToMany,
  ManyToOne, JoinColumn, RelationId,
  Entity, Index, Unique,
} from 'typeorm';

import {ImageResizeSize} from '@shared/types';
import {ImageResizeConfig} from '@server/modules/attachment/services';

import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';
import {ImageAttachmentEntity} from '@server/modules/attachment/entity/ImageAttachment.entity';
import {BrochureEntity} from '../../entity/Brochure.entity';

@Entity('brochure_page')
@Index(['brochure'])
@Unique('unique_page_index', ['brochure', 'index'])
export class BrochurePageEntity extends DatedRecordEntity {
  static readonly imageTableName = 'brochure_image_attachments';

  static readonly IMAGE_SIZES = Object.freeze<ImageResizeConfig>(
    {
      SMALL_THUMB: new ImageResizeSize(78, ''),
      THUMB: new ImageResizeSize(147, ''),
      PREVIEW: new ImageResizeSize(756, ''),
    },
  );

  @Column('int', {nullable: false})
  index: number;

  @ManyToMany(
    () => ImageAttachmentEntity,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinTable(
    {
      name: BrochurePageEntity.imageTableName,
    },
  )
  image: ImageAttachmentEntity[];

  @ManyToOne(() => BrochureEntity, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'brochureId'})
  brochure: BrochureEntity;

  @Column({nullable: true})
  @RelationId((entity: BrochurePageEntity) => entity.brochure)
  brochureId: number;

  constructor(partial: Partial<BrochurePageEntity>) {
    super();
    Object.assign(this, partial);
  }
}
