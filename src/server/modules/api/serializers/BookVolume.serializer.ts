import {Expose} from 'class-transformer';

import {BookVolumeRecord} from '@api/types/BookVolume.record';
import {BaseSerializer} from './Base.serializer';

export class BookVolumeSerializer extends BaseSerializer implements BookVolumeRecord {
  @Expose() name: string;
}
