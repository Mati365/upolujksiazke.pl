import 'isomorphic-fetch';
import gulp from 'gulp';

import {
  refreshSingleTask,
  refreshLatestTask,
  refreshAllTask,
  reanalyzeAllTask,
  runSpiderTask,
} from './scrapper';

gulp.task('scrapper:refresh:single', refreshSingleTask);
gulp.task('scrapper:refresh:latest', refreshLatestTask);
gulp.task('scrapper:refresh:all', refreshAllTask);
gulp.task('scrapper:reanalyze:all', reanalyzeAllTask);
gulp.task('scrapper:spider:run', runSpiderTask);
