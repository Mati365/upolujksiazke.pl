/* eslint-disable import/first */
process.env.CMD_APP_INSTANCE = 'gulp';

import 'isomorphic-fetch';
import gulp from 'gulp';

import * as Scrapper from './scrapper';
import {Website, Category} from './entity';

// entities
gulp.task('entity:website:fetch-missing-logos', Website.fetchMissingLogosTask);
gulp.task('entity:category:refresh-ranking', Category.refreshCategoriesRanking);

// scrapper
gulp.task('scrapper:refresh:single', Scrapper.refreshSingleTask);
gulp.task('scrapper:refresh:latest', Scrapper.refreshLatestTask);
gulp.task('scrapper:refresh:all', Scrapper.refreshAllTask);

gulp.task('scrapper:reanalyze:single', Scrapper.reanalyzeSingleTask);
gulp.task('scrapper:reanalyze:all', Scrapper.reanalyzeAllTask);

gulp.task('scrapper:spider:run', Scrapper.runSpiderTask);
