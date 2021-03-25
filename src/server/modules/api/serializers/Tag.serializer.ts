import {Expose} from 'class-transformer';

import {parameterize} from '@shared/helpers/parameterize';

import {TagRecord} from '@api/types/Tag.record';
import {BaseSerializer} from './Base.serializer';

export class TagSerializer extends BaseSerializer implements TagRecord {
  @Expose() name: string;

  @Expose()
  get parameterizedName() {
    return parameterize(this.name);
  }
}
