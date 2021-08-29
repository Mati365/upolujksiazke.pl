import {ChildEntity} from 'typeorm';

import {TrackerViewsMode} from '@shared/enums';
import {ViewsAggEntity} from './ViewsAgg.entity';

@ChildEntity(TrackerViewsMode.MONTH)
export class MonthlyViewsAggEntity extends ViewsAggEntity {}
