import 'isomorphic-fetch';

import gulp from 'gulp';
import {refreshReviews} from '@server/modules/scrapper/tasks/refreshReviews';

gulp.task('scrapper:refresh', refreshReviews);
