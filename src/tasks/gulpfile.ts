import 'isomorphic-fetch';
import gulp from 'gulp';

import {
  refreshLatestReviewsTask,
  refreshAllReviewsTask,
} from '@server/modules/scrapper/tasks/refreshReviews.task';

gulp.task('scrapper:refresh:latest', refreshLatestReviewsTask);
gulp.task('scrapper:refresh:all', refreshAllReviewsTask);
