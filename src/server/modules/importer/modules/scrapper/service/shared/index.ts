import {ScrapperMetadataKind} from '../../entity';
import {AsyncScrapper} from './AsyncScrapper';
import {HTMLScrapper} from './HTMLScrapper';
import {WebsiteInfoScrapper} from './WebsiteInfoScrapper';

export * from './AsyncScrapper';
export * from './HTMLScrapper';
export * from './Scrapper';
export * from './WebsiteInfoScrapper';

export type WebsiteScrapper<T extends unknown[] = any[]> = (
  (AsyncScrapper<T> | HTMLScrapper<T>) & WebsiteInfoScrapper
);

export type WebsiteScrapperItemInfo = {
  id: number,
  parserSource: string,
  kind: ScrapperMetadataKind,
};
