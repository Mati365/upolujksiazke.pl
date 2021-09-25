import pMap from 'p-map';
import {mapObjIndexed, prop} from 'ramda';

import {
  concatUrlParts,
  safeJsonParse,
  safeDateParse,
  concatUrls,
} from '@shared/helpers';

import {
  cookiesObjToSetCookie,
  normalizeParsedText,
  parseAsyncURLPathIfOK,
  parseCookies,
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

type CarrefourScrapperPagination = ScrapperResult<BrochureScrapperInfo[], number>;

export class CarrefourBrochuresScrapper extends AsyncScrapper<BrochureScrapperInfo[], number> {
  constructor(
    private readonly config: {
      latestBrochuresPath: string,
      singleBrochurePath: string,
      logoURL: string,
    },
  ) {
    super();
  }

  async fetchSingle(id: string): Promise<BrochureScrapperInfo> {
    const {latestBrochuresPath} = this.config;
    const props = (await this.fetchPathInitialState(
      concatUrls(latestBrochuresPath, id),
    ))?.props;

    if (!props)
      return null;

    return this.mapSingleItemResponse(props.pageProps?.item);
  }

  protected async processPage(): Promise<CarrefourScrapperPagination> {
    const {
      websiteURL,
      config: {
        latestBrochuresPath,
        singleBrochurePath,
      },
    } = this;

    const response = await this.fetchPathInitialState(latestBrochuresPath);
    if (!response?.props)
      return null;

    const {props, cookies} = response;
    const leaflets = await pMap(
      props.pageProps?.items || [],
      async ({uuid}) => this.mapSingleItemResponse(
        await fetch(
          concatUrlParts(
            [
              websiteURL,
              singleBrochurePath,
              uuid,
            ],
          ),
          {
            headers: {
              cookie: cookiesObjToSetCookie(
                mapObjIndexed(prop('value'), cookies.parsed),
              ),
            },
          },
        ).then((r) => r.json()),
      ),
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
   * @param {*} item
   * @return {BrochureScrapperInfo}
   * @memberof CarrefourBrochuresScrapper
   */
  mapSingleItemResponse(item: any): BrochureScrapperInfo {
    if (!item?.images)
      return null;

    const {
      websiteURL,
      config: {
        latestBrochuresPath,
        logoURL,
      },
    } = this;

    const remoteId = item.uuid ?? item.id;
    const pdfName = item.filesMap?.pdf?.name;
    const pages = item.images.map(
      ({name}, index: number) => new CreateBrochurePageDto(
        {
          index,
          image: new CreateImageAttachmentDto(
            {
              originalUrl: concatUrlParts([websiteURL, 'images/newspaper/org', name]),
            },
          ),
        },
      ),
    );

    const brand = new CreateBrandDto(
      {
        name: 'Carrefour',
        ...logoURL && {
          logo: new CreateImageAttachmentDto(
            {
              originalUrl: logoURL,
            },
          ),
        },
      },
    );

    const dto = new CreateBrochureDto(
      {
        url: concatUrlParts([websiteURL, latestBrochuresPath, remoteId]),
        title: normalizeParsedText(item.name || item.displayName),
        nsfw: item.alcohol,
        ...pdfName && {
          pdfUrl: concatUrlParts([websiteURL, 'files/newspaper', pdfName]),
        },
        brand,
        validFrom: safeDateParse(item.dateFrom),
        validTo: safeDateParse(item.dateTo),
        pages,
      },
    );

    return {
      kind: ScrapperMetadataKind.BROCHURE,
      parserSource: JSON.stringify(item),
      remoteId,
      dto,
    };
  }

  /**
   * Loads next.js initial website state
   *
   * @private
   * @param {string} path
   * @memberof CarrefourBrochuresScrapper
   */
  private async fetchPathInitialState(path: string) {
    const {websiteURL} = this;
    const result = (await parseAsyncURLPathIfOK(websiteURL, path));

    if (!result)
      return null;

    const {$, response} = result;
    return {
      $,
      cookies: parseCookies(response),
      props: safeJsonParse($('#__NEXT_DATA__').contents().text())?.props?.initialProps,
    };
  }
}
