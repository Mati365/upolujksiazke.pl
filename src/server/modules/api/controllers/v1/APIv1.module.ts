import {Module, forwardRef} from '@nestjs/common';

import {APIModule} from '../../API.module';
import {APIBooksController} from './APIBooks.controller';
import {APIBooksReviewsController} from './APIBooksReviews.controller';
import {APITrackerController} from './APITracker.controller';

@Module(
  {
    imports: [
      forwardRef(() => APIModule),
    ],
    controllers: [
      APIBooksController,
      APITrackerController,
      APIBooksReviewsController,
    ],
  },
)
export class APIv1Module {}
