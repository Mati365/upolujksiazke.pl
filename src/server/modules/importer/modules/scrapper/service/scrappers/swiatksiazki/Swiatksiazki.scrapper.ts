/* eslint-disable @typescript-eslint/no-unused-vars */
import {RemoteID} from '@shared/types';
import {ScrapperWebsiteEntity} from '../../../entity';
import {WebsiteInfoScrapper, fetchWebsiteInfo, HTMLParserAttrs, ScrapperResult} from '../../shared';
import {BookReviewHTMLScrapper, BookReviewScrapperInfo} from '../BookReviewScrapper';

/**
 * Picks data from swiatksiazki.pl
 *
 * @export
 * @class SwiatksiazkiScrapper
 * @extends {BookReviewHTMLScrapper}
 * @implements {WebsiteInfoScrapper}
 */
export class SwiatksiazkiScrapper extends BookReviewHTMLScrapper implements WebsiteInfoScrapper {
  public readonly websiteURL: string = 'https://www.swiatksiazki.pl/';

  /**
   * Fetches website info
   *
   * @returns {Promise<ScrapperWebsiteEntity>}
   * @memberof WykopScrapper
   */
  async fetchWebsiteEntity(): Promise<ScrapperWebsiteEntity> {
    return fetchWebsiteInfo(this.websiteURL);
  }

  protected parsePage(attrs: HTMLParserAttrs): Promise<ScrapperResult<BookReviewScrapperInfo[], string>> {
    throw new Error('Method not implemented.');
  }

  mapSingleItemResponse(item: any): BookReviewScrapperInfo {
    throw new Error('Method not implemented.');
  }

  fetchSingle(remoteId: RemoteID): Promise<BookReviewScrapperInfo> {
    throw new Error('Method not implemented.');
  }

  protected processPage(page: string): Promise<ScrapperResult<BookReviewScrapperInfo[], string>> {
    throw new Error('Method not implemented.');
  }
}
