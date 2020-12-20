import 'isomorphic-fetch';
import gulp from 'gulp';

import {
  refreshSingleTask,
  refreshLatestReviewsTask,
  refreshAllReviewsTask,
} from '@server/modules/scrapper/tasks/refreshReviews.task';

gulp.task('scrapper:refresh:single', refreshSingleTask);
gulp.task('scrapper:refresh:latest', refreshLatestReviewsTask);
gulp.task('scrapper:refresh:all', refreshAllReviewsTask);
