import {Column, Entity} from 'typeorm';
import {DatedRecordEntity} from '../../database/DatedRecord.entity';
import {CreateAttachmentDto} from '../dto/CreateAttachment.dto';

@Entity('attachments')
export class AttachmentEntity extends DatedRecordEntity {
  @Column(
    {
      type: 'varchar',
      length: 140,
    },
  )
  mimetype: string;

  @Column('bigint')
  size: number;

  @Column('text')
  file: string;

  @Column('text', {nullable: true})
  name: string;

  @Column('text', {nullable: true})
  originalUrl: string;

  constructor(partial: Partial<AttachmentEntity>) {
    super();
    Object.assign(this, partial);
  }

  static fromDTO(dto: CreateAttachmentDto) {
    return new AttachmentEntity(
      {
        name: dto.name,
        ...dto.file,
      },
    );
  }
}
