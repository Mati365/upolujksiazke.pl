import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityRepository, SqlEntityManager} from '@mikro-orm/postgresql';
import {Injectable} from '@nestjs/common';

import {ScrapperWebsiteEntity} from '../entity';
import {WebsiteInfoScrapper} from './shared';

@Injectable()
export class WebsiteInfoScrapperService {
  constructor(
    private readonly em: SqlEntityManager,

    @InjectRepository(ScrapperWebsiteEntity)
    private readonly websiteRepository: EntityRepository<ScrapperWebsiteEntity>,
  ) {}

  getWebsiteRepository() {
    return this.websiteRepository;
  }

  /**
   * Loads or creates scrapper website
   *
   * @param {WebsiteInfoScrapper} scrapper
   * @returns
   * @memberof ScrapperService
   */
  async findOrCreateWebsiteEntity(scrapper: WebsiteInfoScrapper) {
    const {websiteRepository, em} = this;
    let website = await websiteRepository.findOne(
      {
        url: scrapper.websiteURL,
      },
    );

    if (!website) {
      website = await scrapper.fetchWebsiteEntity();
      await em.persistAndFlush(website);
    }

    return website;
  }
}
