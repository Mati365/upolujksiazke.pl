import {Logger} from '@nestjs/common';

import {TmpDirService} from '@server/modules/tmp-dir/TmpDir.service';
import {CanBePromise} from '@shared/types';
import {
  AsyncScrapper,
  ScrapperBasicPagination,
  ScrapperResult,
} from '../../shared';

export type EIsbnBookScrapperConfig = {
  tmpDirService: TmpDirService,
};

export class EIsbnBookScrapper extends AsyncScrapper<any> {
  private logger = new Logger(EIsbnBookScrapper.name);

  constructor(
    private readonly config: EIsbnBookScrapperConfig,
  ) {
    super();
  }

  mapSingleItemResponse() {
    return null;
  }

  fetchSingle() {
    return null;
  }

  protected processPage(): CanBePromise<ScrapperResult<any, ScrapperBasicPagination>> {
    return null;
  }
}
