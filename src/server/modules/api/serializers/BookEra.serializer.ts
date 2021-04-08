import {Expose} from 'class-transformer';

import {BookEraRecord} from '@api/types/BookEra.record';
import {BaseSerializer} from './Base.serializer';

export class BookEraSerializer extends BaseSerializer implements BookEraRecord {
  @Expose() name: string;
  @Expose() parameterizedName: string;
}
