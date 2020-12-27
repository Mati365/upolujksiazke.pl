import {ID} from '@shared/types';
import {ScrapperMetadataKind} from '../../entity';

export * from './Scrapper';
export * from './AsyncScrapper';
export * from './HTMLScrapper';
export * from './WebsiteInfoScrapper';
export * from './WebsiteScrappersGroup';

export type WebsiteScrapperItemInfo = {
  id: ID,
  parserSource: string,
  kind: ScrapperMetadataKind,
};
