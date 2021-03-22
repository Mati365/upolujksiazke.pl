import {Expose} from 'class-transformer';

import {BookPrizeRecord} from '@api/types/BookPrize.record';
import {BaseSerializer} from './Base.serializer';

export class BookPrizeSerializer extends BaseSerializer implements BookPrizeRecord {
  @Expose() name: string;
  @Expose() parameterizedName: string;
  @Expose() wikiUrl: string;
}
