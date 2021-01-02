import {WebsiteInfoScrapper, WebsiteScrappersGroup} from '../../shared';

export type LiteraturaGildiaScrappersGroupConfig = {
  homepageURL: string,
};

export class LiteraturaGildiaScrappersGroup extends WebsiteScrappersGroup {
  constructor({homepageURL}: LiteraturaGildiaScrappersGroupConfig) {
    super(
      {
        websiteInfoScrapper: new WebsiteInfoScrapper(homepageURL),
      },
    );
  }
}
