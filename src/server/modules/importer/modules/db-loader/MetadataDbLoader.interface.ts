import {CanBePromise} from '@shared/types';
import {ScrapperMetadataKind} from '../scrapper/entity';

export type InlineMetadataObject = {
  kind: ScrapperMetadataKind,
  content: any,
  url?: string,
  websiteId?: number,
  remoteId?: string,
};

export interface MetadataDbLoader {
  /**
   * Insert metadata info to DB
   *
   * @param {InlineMetadataObject} metadata
   * @returns {Promise<any>}
   * @memberof MetadataDbLoader
   */
  extractMetadataToDb(metadata: InlineMetadataObject): CanBePromise<any>
}
