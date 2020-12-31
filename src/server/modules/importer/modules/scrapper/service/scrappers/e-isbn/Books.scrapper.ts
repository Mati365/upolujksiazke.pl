import {Logger} from '@nestjs/common';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import XMLStream from 'xml-stream';

import {InterceptMethod} from '@shared/helpers/decorators/InterceptMethod';
import {
  TmpDirService,
  EnterTmpFolderScope,
  TmpFolderScopeAttrs,
} from '@server/modules/tmp-dir';

import {CanBePromise} from '@shared/types';
import {
  AsyncScrapper,
  ScrapperBasicPagination,
  ScrapperResult,
} from '../../shared';

export type EIsbnBookScrapperConfig = {
  tmp: {
    dirService: TmpDirService,
    folder: string,
    dbFiles: {
      records: string,
      publishers: string,
    },
  },
};

export class EIsbnBookScrapper extends AsyncScrapper<any> {
  private logger = new Logger(EIsbnBookScrapper.name);

  constructor(
    private readonly config: EIsbnBookScrapperConfig,
  ) {
    super();
    this.getIsbnDBCache();
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

  /**
   * Fetches large isbn database.
   * Checks file cration date - if expires fetches new file
   *
   * @private
   * @memberof EIsbnBookScrapper
   */
  @EnterTmpFolderScope(
    function innerWrapper(this: EIsbnBookScrapper) {
      const {folder, dirService} = this.config.tmp;

      return {
        dirService,
        attrs: {
          name: folder,
          deleteOnExit: false,
          withUUID: false,
        },
      };
    },
  )
  @InterceptMethod(
    function loggerWrapper(this: EIsbnBookScrapper, {tmpFolderPath}: TmpFolderScopeAttrs) {
      this.logger.log(`Entering ${chalk.bold(tmpFolderPath)} tmp folder!`);
    },
  )
  private async getIsbnDBCache({tmpFolderPath}: TmpFolderScopeAttrs = null) {
    const {tmp: {dbFiles}} = this.config;
    const stream = fs.createReadStream(path.join(tmpFolderPath, dbFiles.records));
    const xml = new XMLStream(stream);

    xml.on('endElement: Product', (p) => {
      console.info('s', p);
      throw new Error;
    });
  }
}
