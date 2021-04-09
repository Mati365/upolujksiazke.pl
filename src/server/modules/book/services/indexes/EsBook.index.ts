import {Injectable} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';
import * as R from 'ramda';

import {paginatedAsyncIterator} from '@server/common/helpers/db';
import {plainToClass} from 'class-transformer';

import {BookFullInfoSerializer} from '@server/modules/api/serializers';
import {
  EntityIndex,
  EsMappedDoc,
  PredefinedProperties,
} from '@server/modules/elasticsearch/classes/EntityIndex';

import {
  ImageVersionField,
  WebsiteRecord,
  BookFullInfoRecord,
  BookAvailabilityRecord,
  BookFullInfoReleaseRecord,
} from '@api/types';

import {CardBookSearchService, FullCardEntity} from '../search/CardBookSearch.service';
import {BookEntity} from '../../entity/Book.entity';

export type BookIndexEntity = Omit<BookFullInfoRecord, 'reviews'|'releases'|'hierarchy'>;

@Injectable()
export class EsBookIndex extends EntityIndex<FullCardEntity, BookIndexEntity> {
  static readonly INDEX_NAME = 'books';

  static readonly IMAGE_ATTACHMENT_INDEX_MAPPING: Record<ImageVersionField, any> = (() => {
    const mapping = {
      type: 'nested',
      properties: {
        ratio: {type: 'float'},
        nsfw: {type: 'boolean'},
      },
    };

    return {
      smallThumb: mapping,
      thumb: mapping,
      preview: mapping,
      big: mapping,
    };
  })();

  static readonly WEBSITE_INDEX_MAPPING: Record<keyof WebsiteRecord, any> = {
    id: {type: 'integer'},
    url: {type: 'keyword'},
    description: {type: 'keyword'},
    title: {type: 'keyword'},
    hostname: {type: 'keyword'},
    logo: {
      type: 'nested',
      properties: EsBookIndex.IMAGE_ATTACHMENT_INDEX_MAPPING,
    },
  };

  static readonly BOOK_AVAILABILITY_INDEX_MAPPING: Record<keyof BookAvailabilityRecord, any> = {
    id: {type: 'integer'},
    prevPrice: {type: 'float'},
    price: {type: 'float'},
    avgRating: {type: 'float'},
    totalRatings: {type: 'integer'},
    inStock: {type: 'boolean'},
    url: {type: 'keyword'},
    website: {
      type: 'nested',
      properties: EsBookIndex.WEBSITE_INDEX_MAPPING,
    },
  };

  static readonly BOOK_RELEASE_INDEX_MAPPING: Record<keyof BookFullInfoReleaseRecord, any> = {
    id: {type: 'integer'},
    cover: {
      type: 'nested',
      properties: EsBookIndex.IMAGE_ATTACHMENT_INDEX_MAPPING,
    },

    title: {type: 'text'},
    binding: {type: 'integer'},
    type: {type: 'integer'},
    protection: {type: 'integer'},
    lang: {type: 'keyword'},
    place: {type: 'keyword'},
    format: {type: 'keyword'},
    publishDate: {type: 'keyword'},
    totalPages: {type: 'integer'},
    description: {type: 'keyword'},
    edition: {type: 'keyword'},
    translator: {type: 'keyword'},
    isbn: {type: 'keyword'},
    weight: {type: 'integer'},
    recordingLength: {type: 'integer'},
    parameterizedSlug: {type: 'keyword'},
    defaultPrice: {type: 'integer'},
    publisher: PredefinedProperties.idNamePair,
    availability: {
      type: 'nested',
      properties: EsBookIndex.BOOK_AVAILABILITY_INDEX_MAPPING,
    },
  };

  static readonly BOOK_INDEX_MAPPING: Record<keyof BookIndexEntity, any> = {
    id: {type: 'integer'},
    schoolBookId: {type: 'integer'},
    defaultTitle: {type: 'text'},
    parameterizedSlug: {type: 'keyword'},
    avgRating: {type: 'float'},
    totalRatings: {type: 'integer'},
    allTypes: {type: 'keyword'},
    lowestPrice: {type: 'float'},
    highestPrice: {type: 'float'},
    description: {type: 'text'},
    taggedDescription: {type: 'text'},
    originalPublishDate: {type: 'keyword'},
    volume: PredefinedProperties.idNamePair,
    authors: PredefinedProperties.idNamePair,
    tags: PredefinedProperties.idNamePair,
    categories: PredefinedProperties.idNamePair,
    era: PredefinedProperties.idNamePair,
    genre: PredefinedProperties.idNamePair,
    prizes: PredefinedProperties.idNamePair,
    schoolBook: {
      type: 'nested',
      properties: {
        classLevel: {type: 'integer'},
        obligatory: {type: 'boolean'},
      },
    },
    primaryRelease: {
      type: 'nested',
      properties: EsBookIndex.BOOK_RELEASE_INDEX_MAPPING,
    },
  };

  constructor(
    esService: ElasticsearchService,
    private readonly bookCardSearch: CardBookSearchService,
  ) {
    super(
      esService,
      {
        name: EsBookIndex.INDEX_NAME,
      },
    );
  }

  /**
   * @inheritdoc
   */
  async createIndex(): Promise<void> {
    const {es, indexName} = this;

    await es.indices.create(
      {
        index: indexName,
        body: {
          settings: {
            'index.number_of_replicas': 0,
          },
          mappings: {
            dynamic: false,
            properties: EsBookIndex.BOOK_INDEX_MAPPING,
          },
        },
      },
    );
  }

  /**
   * @inheritdoc
   */
  protected async findEntity(id: number): Promise<FullCardEntity> {
    return this.bookCardSearch.findFullCard(
      {
        id,
        reviewsCount: 8,
      },
    );
  }

  /**
   * @inheritdoc
   */
  protected async* findEntitiesIds(): AsyncGenerator<number[]> {
    const it = paginatedAsyncIterator(
      {
        limit: 30,
        queryExecutor: ({limit, offset}) => (
          BookEntity
            .createQueryBuilder('b')
            .select('b.id')
            .offset(offset)
            .limit(limit)
            .getMany()
        ),
      },
    );

    for await (const [, item] of it)
      yield R.pluck('id', item);
  }

  /**
   * @inheritdoc
   */
  protected mapRecord(entity: FullCardEntity): EsMappedDoc<BookIndexEntity> {
    return {
      _id: entity.id,
      ...plainToClass(
        BookFullInfoSerializer,
        entity,
        {
          excludeExtraneousValues: true,
        },
      ),
    };
  }
}
