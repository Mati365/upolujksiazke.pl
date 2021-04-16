import {Injectable} from '@nestjs/common';
import * as R from 'ramda';

import {CreateBookSummaryDto} from '@server/modules/book/modules/summary/dto';
import {ScrapperMatcherService} from '@scrapper/service/actions';
import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  InlineMetadataObject,
  MetadataDbLoader,
} from '@db-loader/MetadataDbLoader.interface';

import {BookDbLoaderService} from './Book.loader';

@Injectable()
export class BookSummaryDbLoaderService implements MetadataDbLoader {
  constructor(
    private readonly scrapperMatcherService: ScrapperMatcherService,
  ) {}

  extractMetadataToDb(metadata: InlineMetadataObject) {
    console.info(metadata);
    throw new Error('Method not implemented.');
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

    const {scrapperMatcherService} = this;
    const matchedSummaries = R.pluck(
      'result',
      await scrapperMatcherService.searchRemoteRecord<CreateBookSummaryDto>(
        {
          kind: ScrapperMetadataKind.BOOK_SUMMARY,
          data: summary,
        },
      ),
    );

    console.info(matchedSummaries);
    return null;
  }
}
