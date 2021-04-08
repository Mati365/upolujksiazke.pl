import {Expose} from 'class-transformer';

import {BookGenreRecord} from '@api/types/BookGenre.record';
import {BaseSerializer} from './Base.serializer';

export class BookGenreSerializer extends BaseSerializer implements BookGenreRecord {
  @Expose() name: string;
  @Expose() parameterizedName: string;
}
