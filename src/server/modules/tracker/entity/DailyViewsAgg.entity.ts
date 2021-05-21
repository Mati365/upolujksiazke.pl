import {ChildEntity} from 'typeorm';

import {TrackerViewsMode} from '../constants/enums';
import {ViewsAggEntity} from './ViewsAgg.entity';

@ChildEntity(TrackerViewsMode.DAY)
export class DailyViewsEntity extends ViewsAggEntity {}
