import {Expose} from 'class-transformer';

import {BookSummaryHeaderRecord} from '@api/types';
import {BaseSerializer} from './Base.serializer';

export class BookSummaryHeaderSerializer extends BaseSerializer implements BookSummaryHeaderRecord {
  @Expose() title: string;
  @Expose() parameterizedTitle: string;
  @Expose() url: string;
}
