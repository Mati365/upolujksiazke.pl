import * as R from 'ramda';

import {
  concatUrlParts,
  safeJsonParse,
  safeDateParse,
  concatUrls,
} from '@shared/helpers';

import {
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

type CarrefourScrapperPagination = ScrapperResult<BrochureScrapperInfo[], number>;

export class CarrefourBrochuresScrapper extends AsyncScrapper<BrochureScrapperInfo[], number> {
  constructor(
    private readonly config: {
      latestBrochuresPath: string,
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
    const props = (await this.fetchPathInitialState(this.config.latestBrochuresPath))?.props;
    if (!props)
      return null;

    return {
      result: props?.pageProps?.items.map(this.mapSingleItemResponse.bind(this)).filter(Boolean),
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
    if (!item)
      return null;

    const {websiteURL} = this;
    const pdfName = item.filesMap?.pdf?.name;
    const pages = item.images.map(
      ({name, width, height}, index: number) => new CreateBrochurePageDto(
        {
          index,
          ratio: width / height,
          image: new CreateImageAttachmentDto(
            {
              originalUrl: concatUrlParts([websiteURL, 'images/newspaper/org', name]),
            },
          ),
        },
      ),
    );

    const dto = new CreateBrochureDto(
      {
        title: normalizeParsedText(item.name || item.displayName),
        nsfw: item.alcohol,
        ...pdfName && {
          pdfUrl: concatUrlParts([websiteURL, 'files/newspaper', pdfName]),
        },
        brand: new CreateBrandDto(
          {
            name: 'Carrefour',
          },
        ),
        validFrom: safeDateParse(item.dateFrom),
        validTo: safeDateParse(item.dateTo),
        pages,
      },
    );

    return {
      kind: ScrapperMetadataKind.BROCHURE,
      parserSource: JSON.stringify(item),
      remoteId: R.unless(R.isNil, R.slice(1, -1))(item.uuid) || item.id,
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
    const $ = (await parseAsyncURLPathIfOK(websiteURL, path))?.$;

    if (!$)
      return null;

    return {
      $,
      props: safeJsonParse($('#__NEXT_DATA__').contents().text())?.props?.initialProps,
    };
  }
}
