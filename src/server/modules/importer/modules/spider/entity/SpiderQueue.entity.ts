import {
  Column, ManyToOne, Entity,
  JoinColumn, RelationId, Index, Unique,
} from 'typeorm';

import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';
import {RemoteWebsiteEntity} from '@server/modules/remote/entity/RemoteWebsite.entity';

@Entity(
  {
    name: 'scrapper_spider_queue',
  },
)
@Index(['processed', 'website'])
@Unique(['website', 'path'])
export class SpiderQueueEntity extends DatedRecordEntity {
  @Column('text')
  path: string;

  @ManyToOne(() => RemoteWebsiteEntity)
  @JoinColumn({name: 'websiteId'})
  website: RemoteWebsiteEntity;

  @Column()
  @RelationId((entity: SpiderQueueEntity) => entity.website)
  websiteId: number;

  @Column('boolean', {default: false})
  processed: boolean;

  constructor(partial: Partial<SpiderQueueEntity>) {
    super();
    Object.assign(this, partial);
  }
}
