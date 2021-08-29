import {Module} from '@nestjs/common';
import {WykopCommentBot} from './WykopComment.bot';
import {WykopSummaryBot} from './WykopSummary.bot';

@Module(
  {
    providers: [
      WykopCommentBot,
      WykopSummaryBot,
    ],
  },
)
export class WykopBotModule {}
