import {Injectable, Logger} from '@nestjs/common';
import pMap from 'p-map';
import * as R from 'ramda';
import {EventEmitter2} from '@nestjs/event-emitter';
import {plainToClass} from 'class-transformer';

import {CreateBookSummaryDto} from '@server/modules/book/modules/summary/dto';
import {CreateRemoteArticleDto} from '@server/modules/remote/dto';

import {ScrapperMatcherService} from '@scrapper/service/actions';
import {ScrapperMetadataKind} from '@scrapper/entity';
import {ScrapperService} from '@scrapper/service/Scrapper.service';
import {InlineMetadataObject, MetadataDbLoader} from '@db-loader/MetadataDbLoader.interface';

import {BookSummaryService} from '@server/modules/book/modules/summary/BookSummary.service';
import {BookDbLoaderService} from './Book.loader';
import {BookSummaryImportedEvent} from './events';

@Injectable()
export class BookSummaryDbLoaderService implements MetadataDbLoader {
  private readonly logger = new Logger(BookSummaryDbLoaderService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly scrapperMatcherService: ScrapperMatcherService,
    private readonly scrapperService: ScrapperService,
    private readonly summaryService: BookSummaryService,
    private readonly bookDbLoader: BookDbLoaderService,
  ) {}

  /**
   * @inheritdoc
   */
  async extractMetadataToDb(metadata: InlineMetadataObject) {
    const {
      logger,
      scrapperService,
      summaryService,
      bookDbLoader,
      eventEmitter,
    } = this;

    const dto = plainToClass(CreateBookSummaryDto, metadata.content);
    if (!dto?.article) {
      logger.warn('Missing metadata content!');
      return;
    }

    const websiteId = (
      metadata.websiteId
        ?? dto.article.websiteId
        ?? (await scrapperService.findOrCreateWebsiteByUrl(dto.article.url))?.id
    );

    const book = await bookDbLoader.searchAndExtractToDb(
      dto.book,
      {
        checkCacheBeforeSearch: true,
        skipIfAlreadyInDb: true,
        skipDtoMerge: true,
      },
    );

    if (!book) {
      logger.warn(`Unable to match summary book with title "${dto.book.title}"!`);
      return;
    }

    const summaryEntity = await summaryService.upsert(
      new CreateBookSummaryDto(
        {
          ...dto,
          bookId: book.id,
          article: new CreateRemoteArticleDto(
            {
              ...dto?.article,
              websiteId,
            },
          ),
        },
      ),
    );

    await eventEmitter.emitAsync(
      'loader.summary.imported',
      new BookSummaryImportedEvent(summaryEntity, dto),
    );
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

    if (R.isEmpty(matchedItems))
      return null;

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
