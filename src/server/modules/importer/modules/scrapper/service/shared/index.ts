import {ScrapperMetadataKind} from '../../entity';

export * from './Scrapper';
export * from './AsyncScrapper';
export * from './HTMLScrapper';
export * from './WebsiteInfoScrapper';
export * from './WebsiteScrappersGroup';

export type WebsiteScrapperItemInfo<T = any> = {
  remoteId: string,
  parserSource: string,
  kind: ScrapperMetadataKind,
  dto: T,
  url: string,
};
