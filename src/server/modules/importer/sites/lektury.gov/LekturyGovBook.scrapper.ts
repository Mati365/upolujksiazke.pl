import * as R from 'ramda';
import pMap from 'p-map';

import {BookSchoolLevel} from '@shared/enums';

import {normalizeURL} from '@server/common/helpers';
import {findKeyByValue, getNextObjKey, timeout} from '@shared/helpers';
import {findAndMap} from '@shared/helpers/findAndMap';

import {CreateBookDto} from '@server/modules/book';
import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateSchoolBookDto} from '@server/modules/book/dto';
import {CreateBookEraDto} from '@server/modules/book/modules/era/dto/CreateBookEra.dto';
import {CreateBookGenreDto} from '@server/modules/book/modules/genre/dto/CreateBookGenre.dto';
import {CreateBookCategoryDto} from '@server/modules/book/modules/category/dto/CreateBookCategory.dto';

import {AsyncScrapper, ScrapperResult} from '@scrapper/service/shared';
import {BookScrapperInfo} from '../../kinds/scrappers/Book.scrapper';
import {LekturyGovScrappersGroup} from './LekturyGovScrappersGroup';
import {ScrapperMetadataKind} from '../../modules/scrapper/entity';

type LekturyGovPagination = {
  level: BookSchoolLevel,
  number: number,
};

type LekturyGobScrapperPagination = (
  Promise<ScrapperResult<BookScrapperInfo[], LekturyGovPagination>>
);

/**
 * @see {@link https://lektury.gov.pl/}
 *
 * @export
 * @class LekturyGovBookScrapper
 * @extends {AsyncScrapper<BookScrapperInfo[]>}
 */
export class LekturyGovBookScrapper extends AsyncScrapper<BookScrapperInfo[], LekturyGovPagination> {
  static readonly OBLIGATORY_RANGE_ID = 34;
  static readonly SCHOOL_LEVELS_IDS: Record<BookSchoolLevel, number> = {
    [BookSchoolLevel.I_III]: 34,
    [BookSchoolLevel.IV_VI]: 22,
    [BookSchoolLevel.VII_VIII]: 7,
    [BookSchoolLevel.HIGH_SCHOOL]: 10,
    [BookSchoolLevel.HIGH_SCHOOL_EXPANDED]: 18,
  };

  constructor() {
    super(
      {
        pageProcessDelay: 4000,
      },
    );
  }

  get api() {
    return (<LekturyGovScrappersGroup> this.group).api;
  }

  mapSingleItemResponse(book: any): BookScrapperInfo {
    const dto = new CreateBookDto(
      {
        defaultTitle: book.title,
        schoolBook: new CreateSchoolBookDto(
          {
            classLevel: findAndMap(
              (item: any) => {
                const level = findKeyByValue(item.id, LekturyGovBookScrapper.SCHOOL_LEVELS_IDS);
                if (R.isNil(level))
                  return null;

                return +level;
              },
              book.range,
            ),
            obligatory: R.any(
              R.propEq('id', LekturyGovBookScrapper.OBLIGATORY_RANGE_ID),
              book.range,
            ),
          },
        ),
        authors: book.authorBookLink.map(({postTitle}) => new CreateBookAuthorDto(
          {
            name: postTitle,
          },
        )),
        releases: [
          new CreateBookReleaseDto(
            {
              title: book.title,
              cover: book.bookCover && new CreateImageAttachmentDto(
                {
                  originalUrl: normalizeURL(book.bookCover),
                },
              ),
            },
          ),
        ],
        categories: (
          book
            .range
            .map(({id, name}) => (
              id === LekturyGovBookScrapper.OBLIGATORY_RANGE_ID
                ? new CreateBookCategoryDto(
                  {
                    name,
                  },
                )
                : null
            ))
            .filter(Boolean)
        ),
        era: book.era.map(({name}) => new CreateBookEraDto(
          {
            name,
          },
        )),
        genre: book.genre.map(({name}) => new CreateBookGenreDto(
          {
            name,
          },
        )),
      },
    );

    return {
      kind: ScrapperMetadataKind.BOOK,
      remoteId: book.id,
      parserSource: JSON.stringify(book),
      dto,
    };
  }

  /**
   * Fetches and parses single item
   *
   * @param {string} id
   * @returns {Promise<BookScrapperInfo>}
   * @memberof LekturyGovBookScrapper
   */
  async fetchSingle(id: string): Promise<BookScrapperInfo> {
    const {api} = this;
    const result = await api.get<any>(
      {
        path: `v1/data/reading/${id}`,
      },
    );

    return this.mapSingleItemResponse(result);
  }

  /**
   * Fetches whole items page
   *
   * @protected
   * @param {LekturyGovPagination} page
   * @returns {LekturyGobScrapperPagination}
   * @memberof LekturyGovBookScrapper
   */
  protected async processPage(page: LekturyGovPagination): LekturyGobScrapperPagination {
    const {api} = this;

    page ??= {
      level: BookSchoolLevel.I_III,
      number: 1,
    };

    const levelId = LekturyGovBookScrapper.SCHOOL_LEVELS_IDS[page.level];
    const {elements, totalPages} = await api.get<any>(
      {
        path: 'v1/data/readings',
        urlParams: {
          taxonomy: 'range',
          taxonomy_id: levelId,
          page: page.number,
          per_page: 16,
        },
      },
    );

    const fullBookItems = await pMap(
      elements,
      async ({slug}) => {
        const result = await this.fetchSingle(slug);
        await timeout(1000);
        return result;
      },
      {
        concurrency: 2,
      },
    );

    let nextPage: LekturyGovPagination = (
      page.number + 1 < totalPages
        ? {
          number: page.number + 1,
          level: page.level,
        }
        : null
    );

    if (!nextPage) {
      const nextLevelKey = getNextObjKey(
        page.level,
        LekturyGovBookScrapper.SCHOOL_LEVELS_IDS,
      );

      if (!R.isNil(nextLevelKey)) {
        nextPage = {
          number: 1,
          level: <BookSchoolLevel> +nextLevelKey,
        };
      }
    }

    return {
      result: fullBookItems.filter(Boolean),
      ptr: {
        nextPage,
      },
    };
  }
}
