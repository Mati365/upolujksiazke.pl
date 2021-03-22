import {Expose} from 'class-transformer';

import {BookPublisherRecord} from '@api/types/BookPublisher.record';
import {BaseSerializer} from './Base.serializer';

export class BookPublisherSerializer extends BaseSerializer implements BookPublisherRecord {
  @Expose() name: string;
  @Expose() parameterizedName: string;
  @Expose() websiteURL: string;
  @Expose() description: string;
  @Expose() address: string;
}
