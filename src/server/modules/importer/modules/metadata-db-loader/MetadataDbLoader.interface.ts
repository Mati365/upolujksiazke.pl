import {ScrapperMetadataEntity} from '../scrapper/entity';

export interface MetadataDbLoader {
  loadMetadataToDb(metadata: ScrapperMetadataEntity): Promise<void>
}
