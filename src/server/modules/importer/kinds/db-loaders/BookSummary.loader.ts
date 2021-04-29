import {Injectable} from '@nestjs/common';
import * as R from 'ramda';
import pMap from 'p-map';

import {CreateBookSummaryDto} from '@server/modules/book/modules/summary/dto';
import {CreateRemoteArticleDto} from '@server/modules/remote/dto';

import {ScrapperMatcherService} from '@scrapper/service/actions';
import {ScrapperMetadataKind} from '@scrapper/entity';
import {ScrapperService} from '@scrapper/service/Scrapper.service';
import {MetadataDbLoader} from '@db-loader/MetadataDbLoader.interface';

import {BookSummaryService} from '@server/modules/book/modules/summary/BookSummary.service';
import {BookDbLoaderService} from './Book.loader';

@Injectable()
export class BookSummaryDbLoaderService implements MetadataDbLoader {
  constructor(
    private readonly scrapperMatcherService: ScrapperMatcherService,
    private readonly scrapperService: ScrapperService,
    private readonly summaryService: BookSummaryService,
  ) {}

  extractMetadataToDb() {
    throw new Error('Method not implemented!');
  }

  /**
   * Checks is summary has enough fields to be scrapped
   *
   * @static
   * @param {CreateBookSummaryDto} summary
   * @returns
   * @memberof BookSummaryDbLoaderService
   */
  static isEnoughToBeScrapped(summary: CreateBookSummaryDto) {
    return (
      BookDbLoaderService.isEnoughToBeScrapped(summary?.book)
    );
  }

  /**
   * Search all book articles for book
   *
   * @param {CreateBookSummaryDto} dto
   * @memberof BookSummaryDbLoaderService
   */
  async searchAndExtractToDb(summary: CreateBookSummaryDto) {
    if (!BookSummaryDbLoaderService.isEnoughToBeScrapped(summary))
      return null;

    const {
      scrapperService,
      summaryService,
      scrapperMatcherService,
    } = this;

    const {matchedItems} = await scrapperMatcherService.searchRemoteRecord<CreateBookSummaryDto>(
      {
        kind: ScrapperMetadataKind.BOOK_SUMMARY,
        data: summary,
      },
    );

    const matchedSummaries = R.pluck('result', matchedItems);
    const websites = await scrapperService.findOrCreateWebsitesByUrls(
      R.map(
        (item) => item.url,
        matchedSummaries,
      ),
    );

    return pMap(
      matchedSummaries.map((item) => new CreateBookSummaryDto(
        {
          ...item,
          book: summary.book,
          bookId: summary.bookId,
          article: new CreateRemoteArticleDto(
            {
              ...item.article,
              websiteId: websites[item.url]?.id,
            },
          ),
        },
      )),
      (item) => summaryService.upsert(item),
      {
        concurrency: 3,
      },
    );
  }
}
