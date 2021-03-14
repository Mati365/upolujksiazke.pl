import {Expose} from 'class-transformer';

import {parameterize} from '@shared/helpers/parameterize';

import {BookTagRecord} from '@api/types/BookTag.record';
import {BaseSerializer} from './Base.serializer';

export class BookTagSerializer extends BaseSerializer implements BookTagRecord {
  @Expose() name: string;

  @Expose()
  get parameterizedName() {
    return parameterize(this.name);
  }
}
