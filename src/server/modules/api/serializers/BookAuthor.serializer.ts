import {Expose} from 'class-transformer';

import {BookAuthorRecord} from '@api/types/BookAuthor.record';
import {BaseSerializer} from './Base.serializer';

export class BookAuthorSerializer extends BaseSerializer implements BookAuthorRecord {
  @Expose() name: string;
  @Expose() parameterizedName: string;
}
