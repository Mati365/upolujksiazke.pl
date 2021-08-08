import {Injectable} from '@nestjs/common';

import {
  BookDbLoaderService,
  BookReviewDbLoaderService,
  BookSummaryDbLoaderService,
  UrlDbLoaderService,
} from '@importer/kinds/db-loaders';

import {ScrapperMetadataKind} from '../../scrapper/entity';
import {InlineMetadataObject, MetadataDbLoader} from '../MetadataDbLoader.interface';

@Injectable()
export class MetadataDbLoaderService implements MetadataDbLoader {
  public readonly resourceLoaders: Record<ScrapperMetadataKind, MetadataDbLoader>;

  constructor(
    readonly bookReviewDbLoader: BookReviewDbLoaderService,
    readonly bookDbLoader: BookDbLoaderService,
    readonly bookSummaryDbLoader: BookSummaryDbLoaderService,
    readonly urlDbLoader: UrlDbLoaderService,
  ) {
    this.resourceLoaders = {
      [ScrapperMetadataKind.URL]: urlDbLoader,
      [ScrapperMetadataKind.BOOK_REVIEW]: bookReviewDbLoader,
      [ScrapperMetadataKind.BOOK]: bookDbLoader,
      [ScrapperMetadataKind.BOOK_SUMMARY]: bookSummaryDbLoader,
      [ScrapperMetadataKind.BROCHURE]: null,
      [ScrapperMetadataKind.BOOK_AUTHOR]: null,
      [ScrapperMetadataKind.BOOK_PUBLISHER]: null,
    };
  }

  /**
   * Main db loader method, loads scrapper result into db
   *
   * @param {InlineMetadataObject} metadata
   * @memberof MetadataDbLoaderService
   */
  async extractMetadataToDb(metadata: InlineMetadataObject) {
    const {resourceLoaders} = this;
    const loader = resourceLoaders[metadata.kind];

    if (!loader)
      throw new Error(`Unknown entity loader(kind: ${metadata.kind})!`);

    await loader.extractMetadataToDb(metadata);
  }
}
