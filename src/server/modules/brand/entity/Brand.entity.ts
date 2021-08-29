import {
  Entity, ManyToOne, JoinColumn,
  Column, RelationId, ManyToMany,
  JoinTable, BeforeInsert, BeforeUpdate,
} from 'typeorm';

import {truncateLevenshteinText} from '@server/common/helpers';
import {parameterize} from '@shared/helpers/parameterize';

import {ImageResizeSize} from '@shared/types';
import {ImageResizeConfig} from '@server/modules/attachment/services';
import {ImageAttachmentEntity} from '@server/modules/attachment/entity/ImageAttachment.entity';
import {DatedRecordEntity} from '../../database/DatedRecord.entity';
import {RemoteWebsiteEntity} from '../../remote/entity/RemoteWebsite.entity';

@Entity('brands')
export class BrandEntity extends DatedRecordEntity {
  static readonly logoTableName = 'brand_logo_image_attachments';

  static readonly LOGO_IMAGE_SIZES = Object.freeze<ImageResizeConfig>(
    {
      SMALL_THUMB: new ImageResizeSize(78, ''),
      THUMB: new ImageResizeSize(147, ''),
      PREVIEW: new ImageResizeSize(220, ''),
    },
  );

  @Column('text', {unique: true})
  parameterizedName: string;

  @Column('text', {nullable: false})
  name: string;

  @Column('text', {nullable: true})
  description: string;

  @ManyToOne(() => RemoteWebsiteEntity)
  @JoinColumn({name: 'websiteId'})
  website: RemoteWebsiteEntity;

  @Column()
  @RelationId((entity: BrandEntity) => entity.website)
  websiteId: number;

  @ManyToMany(
    () => ImageAttachmentEntity,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinTable(
    {
      name: BrandEntity.logoTableName,
    },
  )
  logo: ImageAttachmentEntity[];

  constructor(partial: Partial<BrandEntity>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {parameterizedName, name} = this;

    if (name)
      this.name = truncateLevenshteinText(name);

    if (!parameterizedName && this.name)
      this.parameterizedName = parameterize(this.name);
  }
}
