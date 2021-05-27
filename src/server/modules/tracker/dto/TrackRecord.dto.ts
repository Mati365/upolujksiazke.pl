import {IsDefined, IsEnum, IsNumber} from 'class-validator';

import {TrackerRecordType} from '@shared/enums';
import {ViewsAggEntity} from '../entity';

export class TrackRecordDto implements Pick<ViewsAggEntity, 'type' | 'recordId'> {
  @IsDefined()
  @IsEnum(TrackerRecordType)
  type: TrackerRecordType;

  @IsDefined()
  @IsNumber()
  recordId: number;
}
