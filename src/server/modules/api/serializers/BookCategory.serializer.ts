import {Expose} from 'class-transformer';

import {BookCategoryRecord} from '@api/types/BookCategory.record';
import {BaseSerializer} from './Base.serializer';

export class BookCategorySerializer extends BaseSerializer implements BookCategoryRecord {
  @Expose() name: string;
  @Expose() icon: string;
  @Expose() root?: boolean;
  @Expose() parameterizedName: string;
}
