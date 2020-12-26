import {Embeddable, Index, ManyToOne, Property} from '@mikro-orm/core';
import {ScrapperWebsiteEntity} from '@server/modules/importer/modules/scrapper/entity';

@Embeddable()
export class ScrapperRemoteEntity {
  @Index()
  @Property()
  id!: string;

  @ManyToOne(() => ScrapperWebsiteEntity)
  website!: ScrapperWebsiteEntity;
}
