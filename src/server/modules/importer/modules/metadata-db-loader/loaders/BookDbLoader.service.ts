/* eslint-disable @typescript-eslint/no-unused-vars */
import {Injectable} from '@nestjs/common';

import {ScrapperMetadataEntity} from '../../scrapper/entity';
import {MetadataDbLoader} from '../MetadataDbLoader.interface';

@Injectable()
export class BookDbLoader implements MetadataDbLoader {
  async extractMetadataToDb(metadata: ScrapperMetadataEntity) {
    throw new Error('Not implemented!');
  }
}
