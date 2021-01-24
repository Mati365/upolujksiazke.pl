import {
  Column, ManyToOne, Unique, Entity,
  JoinColumn, RelationId, EntityOptions,
} from 'typeorm';

import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';
import {RemoteWebsiteEntity} from './RemoteWebsite.entity';

export abstract class RemoteRecordFields extends DatedRecordEntity {
  @Column('boolean', {default: false})
  showOnlyAsQuote: boolean;

  @Column('text', {nullable: true})
  url: string;

  @Column('text', {nullable: true})
  remoteId: string;

  @ManyToOne(() => RemoteWebsiteEntity)
  @JoinColumn({name: 'websiteId'})
  website: RemoteWebsiteEntity;

  @Column()
  @RelationId((entity: RemoteRecordFields) => entity.website)
  websiteId: number;

  constructor(partial: Partial<RemoteRecordFields>) {
    super();
    Object.assign(this, partial);
  }
}

export function RemoteRecordEntity<F extends {new (...args: any[]): {}}>(options?: EntityOptions) {
  if (!options.name)
    throw new Error('Missing table name!');

  return (Base: F): any => {
    Unique(`${options.name}_unique_remote`, ['website', 'remoteId'])(Base as any);

    return Entity(options)(Base);
  };
}
