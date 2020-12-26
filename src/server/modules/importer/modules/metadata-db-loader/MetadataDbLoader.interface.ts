import {ScrapperMetadataEntity} from '../scrapper/entity';

export interface MetadataDbLoader {
  extractMetadataToDb(metadata: ScrapperMetadataEntity): Promise<void>
}
