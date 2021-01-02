import 'isomorphic-fetch';
import gulp from 'gulp';

import {
  refreshSingleTask,
  refreshLatestReviewsTask,
  refreshAllReviewsTask,
  reanalyzeAllReviewsTask,
} from './scrapper';

gulp.task('scrapper:refresh:single', refreshSingleTask);
gulp.task('scrapper:refresh:latest', refreshLatestReviewsTask);
gulp.task('scrapper:refresh:all', refreshAllReviewsTask);
gulp.task('scrapper:reanalyze:all', reanalyzeAllReviewsTask);
