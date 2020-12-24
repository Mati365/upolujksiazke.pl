/* eslint-disable @typescript-eslint/no-unused-vars */
import {ID} from '@shared/types';
import {ScrapperWebsiteEntity} from '@server/modules/scrapper/entity';
import {WebsiteInfoScrapper, fetchWebsiteInfo, HTMLParserAttrs, ScrapperResult} from '../../shared';
import {BookReviewHTMLScrapper, BookReviewScrapperInfo} from '../BookReviewScrapper';

/**
 * Picks data from booklips.pl
 *
 * @export
 * @class BooklipsScrapper
 * @extends {BookReviewHTMLScrapper}
 * @implements {WebsiteInfoScrapper}
 */
export class BooklipsScrapper extends BookReviewHTMLScrapper implements WebsiteInfoScrapper {
  public readonly websiteURL: string = 'https://booklips.pl/';

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

  fetchSingle(remoteId: ID): Promise<BookReviewScrapperInfo> {
    throw new Error('Method not implemented.');
  }

  protected processPage(page: string): Promise<ScrapperResult<BookReviewScrapperInfo[], string>> {
    throw new Error('Method not implemented.');
  }
}
