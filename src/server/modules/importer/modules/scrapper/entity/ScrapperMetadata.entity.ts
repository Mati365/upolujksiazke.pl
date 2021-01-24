import {Column, Index} from 'typeorm';

import {RemoteRecordEntity, RemoteRecordFields} from '@server/modules/remote/entity';
import {WebsiteScrapperItemInfo} from '../service/shared';

export enum ScrapperMetadataKind {
  BOOK_REVIEW = 1,
  BOOK = 2,
  BOOK_AUTHOR = 3,
  BOOK_PUBLISHER = 4,
}

export enum ScrapperMetadataStatus {
  IMPORTED = 1,
  PROCESSING = 2,
  NEW = 3,
}

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
export class ScrapperMetadataEntity extends RemoteRecordFields {
  static get inactive() {
    return (
      ScrapperMetadataEntity
        .createQueryBuilder()
        .where('(content->\'dto\'->>\'description\')::text is null')
    );
  }

  @Column('jsonb')
  content: WebsiteScrapperItemInfo;

  @Index()
  @Column(
    {
      type: 'enum',
      enum: ScrapperMetadataKind,
      default: ScrapperMetadataKind.BOOK_REVIEW,
    },
  )
  kind: ScrapperMetadataKind;

  @Index()
  @Column(
    {
      type: 'enum',
      enum: ScrapperMetadataStatus,
      default: ScrapperMetadataStatus.NEW,
    },
  )
  status: ScrapperMetadataStatus;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<ScrapperMetadataEntity>) {
    super(partial);
  }
}
