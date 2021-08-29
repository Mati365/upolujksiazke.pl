import {
  Column, ManyToOne, Unique, Entity,
  JoinColumn, RelationId, EntityOptions,
} from 'typeorm';

import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';
import {RemoteWebsiteEntity} from './RemoteWebsite.entity';

export interface TrackScrappersList {
  scrappersIds: number[],
}

export abstract class RemoteRecordFields extends DatedRecordEntity {
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

type RemoteRecordEntityOptions = EntityOptions & {
  withUniqConstraint?: boolean,
};

export function RemoteRecordEntity<F extends {new (...args: any[]): {}}>(
  {
    withUniqConstraint = true,
    ...options
  }: RemoteRecordEntityOptions = {},
) {
  if (!options.name)
    throw new Error('Missing table name!');

  return (Base: F): any => {
    if (withUniqConstraint)
      Unique(`${options.name}_unique_remote`, ['website', 'remoteId'])(Base as any);

    return Entity(options)(Base);
  };
}
