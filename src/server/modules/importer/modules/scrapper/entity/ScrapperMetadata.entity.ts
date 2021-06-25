import {Column, Index} from 'typeorm';
import {RemoteRecordEntity, RemoteRecordFields} from '@server/modules/remote/entity';
import {
  ScrapperMetadataKind,
  ScrapperMetadataStatus,
} from '../constants/enums';

export * from '../constants/enums';

/**
 * Saves already scrapped records (in case of improve scrappers)
 *
 * @export
 * @class ScrapperMetadataEntity
 * @extends {RemoteRecordFields}
 */
@RemoteRecordEntity(
  {
    name: 'scrapper_metadata',
  },
)
@Index(['kind'])
@Index(['status'])
export class ScrapperMetadataEntity extends RemoteRecordFields {
  @Column('text', {nullable: true})
  parserSource: string;

  @Column('jsonb', {nullable: true})
  content: any;

  @Column(
    {
      type: 'enum',
      enum: ScrapperMetadataKind,
      default: ScrapperMetadataKind.BOOK_REVIEW,
    },
  )
  kind: ScrapperMetadataKind;

  @Column(
    {
      type: 'enum',
      enum: ScrapperMetadataStatus,
      default: ScrapperMetadataStatus.NEW,
    },
  )
  status: ScrapperMetadataStatus;

  @Column(
    {
      type: 'timestamp',
    },
  )
  processedAt: Date = new Date;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<ScrapperMetadataEntity>) {
    super(partial);
  }
}
