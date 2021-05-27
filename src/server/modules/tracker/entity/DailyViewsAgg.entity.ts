import {ChildEntity} from 'typeorm';

import {TrackerViewsMode} from '@shared/enums';
import {ViewsAggEntity} from './ViewsAgg.entity';

@ChildEntity(TrackerViewsMode.DAY)
export class DailyViewsAggEntity extends ViewsAggEntity {}
