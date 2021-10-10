import pMap from 'p-map';
import {includes, times, findIndex, uniq} from 'ramda';

import {Duration} from '@shared/types';
import {
  buildURL,
  concatUrlParts,
  concatUrls,
} from '@shared/helpers';

import {
  AsyncURLParseResult,
  normalizeParsedText,
  parseAsyncURLPathIfOK,
} from '@server/common/helpers';

import {BrochureScrapperInfo} from '@importer/kinds/scrappers';
import {CreateBrochureDto} from '@server/modules/brochure/dto/CreateBrochure.dto';
import {CreateBrandDto} from '@server/modules/brand/dto/CreateBrand.dto';
import {
  AsyncScrapper,
  ScrapperResult,
} from '@scrapper/service/shared';

import {CreateBrochurePageDto} from '@server/modules/brochure/modules/brochure-page/dto/BrochurePage.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {ScrapperMetadataKind} from '../../modules/scrapper/entity';

type BiedronkaScrapperPagination = ScrapperResult<BrochureScrapperInfo[], number>;

export class BiedronkaBrochuresScrapper extends AsyncScrapper<BrochureScrapperInfo[], number> {
  static readonly MONTHS_SHORTCUTS = [
    'sty', 'lu', 'mar', 'kw', 'maj', 'cze',
    'lip', 'sie', 'wrz', 'paź', 'lis', 'gru',
  ];

  constructor(
    private readonly config: {
      apiPath?: string,
      latestBrochuresPath: string,
      logoURL: string,
    },
  ) {
    super();
  }

  /**
   * Build URL to api that retunrs json or images or pdf
   *
   * @param {object} searchParams
   * @return {string}
   * @memberof BiedronkaBrochuresScrapper
   */
  buildFlexPaperUrl(searchParams: object): string {
    const {websiteURL, config} = this;

    return buildURL(
      concatUrls(websiteURL, config.apiPath),
      searchParams,
    );
  }

  /**
   * Fetches and parses json response
   *
   * @param {object} searchParams
   * @return {*}
   * @memberof BiedronkaBrochuresScrapper
   */
  fetchFlexAPIJsonResult(searchParams: object): any {
    return (
      fetch(this.buildFlexPaperUrl(
        {
          ...searchParams,
          format: 'json',
        },
      ))
        .then((r) => r.json())
    );
  }

  async fetchSingle(path: string): Promise<BrochureScrapperInfo> {
    const {websiteURL} = this;

    return this.mapSingleItemResponse(
      await parseAsyncURLPathIfOK(websiteURL, path),
    );
  }

  protected async processPage(): Promise<BiedronkaScrapperPagination> {
    const {
      websiteURL,
      config: {
        latestBrochuresPath,
      },
    } = this;

    const $ = (await parseAsyncURLPathIfOK(websiteURL, latestBrochuresPath))?.$;
    if (!$)
      return null;

    const pageLinks = uniq(
      $('#container .page-slot[href]')
        .toArray()
        .map((item) => $(item).attr('href'))
        .filter((href) => includes('press,id,', href)),
    );

    const leaflets = await pMap(
      pageLinks || [],
      (href) => this.fetchSingle(href),
      {
        concurrency: 2,
      },
    );

    return {
      result: leaflets.filter(Boolean),
      ptr: {
        nextPage: null,
      },
    };
  }

  /**
   * Maps single carrefour initial state brochure
   *
   * @param {AsyncURLParseResult} item
   * @return {BrochureScrapperInfo}
   * @memberof CarrefourBrochuresScrapper
   */
  async mapSingleItemResponse(result: AsyncURLParseResult): Promise<BrochureScrapperInfo> {
    if (!result)
      return null;

    const {$, url} = result;
    const html = $.html();

    const {
      websiteURL,
      config: {
        latestBrochuresPath,
        logoURL,
      },
    } = this;

    const remoteId = url.match(/press,id,([^,]+),/)[1];
    const [doc, subfolder] = [
      html.match(/var startDocument = "([^"]+)";/)[1],
      html.match(/var subfolder = "([^"]+)";/)[1],
    ];

    const totalPages = (await this.fetchFlexAPIJsonResult(
      {
        subfolder,
        doc,
      },
    )).length;

    const pages = times(
      (index) => new CreateBrochurePageDto(
        {
          index,
          image: new CreateImageAttachmentDto(
            {
              originalUrl: this.buildFlexPaperUrl(
                {
                  format: 'jpg',
                  page: index + 1,
                  subfolder,
                  doc,
                },
              ),
            },
          ),
        },
      ),
      totalPages,
    );

    const brand = new CreateBrandDto(
      {
        name: 'Biedronka',
        ...logoURL && {
          logo: new CreateImageAttachmentDto(
            {
              originalUrl: logoURL,
            },
          ),
        },
      },
    );

    const duration = BiedronkaBrochuresScrapper.parseDurationTitle(
      $('#date > span').text().trim(),
    );

    const dto = new CreateBrochureDto(
      {
        url: concatUrlParts(
          [
            websiteURL,
            latestBrochuresPath,
            remoteId,
          ],
        ),
        title: normalizeParsedText(
          $('head > title').text(),
        ),
        validFrom: duration.begin,
        validTo: duration.end,
        brand,
        pages,
      },
    );

    return {
      kind: ScrapperMetadataKind.BROCHURE,
      parserSource: null,
      remoteId,
      dto,
    };
  }

  static parseTranslatedDate(date: string) {
    const {day, month, year} = (
      date
        .match(/^(?<day>\d+)\s(?<month>[^\s]+)\s(?<year>\d+)/)
        .groups
    );

    const monthIndex = findIndex(
      (shortcut) => month.startsWith(shortcut),
      BiedronkaBrochuresScrapper.MONTHS_SHORTCUTS,
    );

    return new Date(+year, monthIndex, +day);
  }

  static parseDurationTitle(title: string): Duration {
    const [begin, end] = title.match(/od (.*) do (.*)/)?.slice(1, 3);

    return {
      begin: BiedronkaBrochuresScrapper.parseTranslatedDate(begin),
      end: BiedronkaBrochuresScrapper.parseTranslatedDate(end),
    };
  }
}
