import {Expose} from 'class-transformer';

import {SchoolBookRecord} from '@api/types/SchoolBook.record';
import {BookSchoolLevel} from '@shared/enums/school';
import {BaseSerializer} from './Base.serializer';

export class SchoolBookSerializer extends BaseSerializer implements SchoolBookRecord {
  @Expose() classLevel: BookSchoolLevel;
  @Expose() obligatory: boolean;
}
