import {Injectable} from '@nestjs/common';

import {ScrapperMetadataEntity} from '../../scrapper/entity';
import {MetadataDbLoader} from '../MetadataDbLoader.interface';

@Injectable()
export class BookReviewDbLoader implements MetadataDbLoader {
  async loadMetadataToDb(metadata: ScrapperMetadataEntity) {
    console.info(metadata);
  }
}
