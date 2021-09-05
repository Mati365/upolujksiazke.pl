import {Module} from '@nestjs/common';

import {RecommendationModule} from '@server/modules/recommendation';
import {BookModule} from '@server/modules/book/Book.module';
import {ScrapperModule} from '@server/modules/importer/modules/scrapper/Scrapper.module';
import {WykopCommentBot} from './bots/WykopComment.bot';
import {WykopSummaryBot} from './bots/WykopSummary.bot';
import {WykopStatsService} from './WykopStats.service';

@Module(
  {
    imports: [
      RecommendationModule,
      BookModule,
      ScrapperModule,
    ],
    providers: [
      WykopStatsService,
      WykopCommentBot,
      WykopSummaryBot,
    ],
    exports: [
      WykopStatsService,
      WykopCommentBot,
      WykopSummaryBot,
    ],
  },
)
export class WykopBotModule {}
