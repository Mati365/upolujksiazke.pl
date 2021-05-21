import {ChildEntity} from 'typeorm';

import {TrackerViewsMode} from '../constants/enums';
import {ViewsAggEntity} from './ViewsAgg.entity';

@ChildEntity(TrackerViewsMode.MONTH)
export class MonthlyViewsAggEntity extends ViewsAggEntity {}
