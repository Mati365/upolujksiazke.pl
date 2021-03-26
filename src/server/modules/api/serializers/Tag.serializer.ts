import {Expose} from 'class-transformer';

import {TagRecord} from '@api/types/Tag.record';
import {BaseSerializer} from './Base.serializer';

export class TagSerializer extends BaseSerializer implements TagRecord {
  @Expose() name: string;
  @Expose() parameterizedName: string;
}
