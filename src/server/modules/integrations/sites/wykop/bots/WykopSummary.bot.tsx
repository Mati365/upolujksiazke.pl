import React, {Fragment} from 'react';
import {Injectable, Logger} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import * as R from 'ramda';

import {nthWeeksAgoDuration, isDevMode} from '@shared/helpers';
import {renderJSXToMessage} from '../helpers';

import {WykopOptionalMatchReview} from '../constants/types';
import {
  BotMessageFooter,
  BotSummaryHeader,
  BotSummaryTopUpvoted,
} from '../components';

import {
  DurationAttrs,
  WykopRanking,
  WykopStatsService,
} from '../WykopStats.service';

import {WYKOP_ENV} from '../constants/wykopEnv';

type SummaryMessageGeneratorAttrs = WykopRanking & DurationAttrs & {
  tags?: string[],
};

/**
 * @todo
 *  - Refresh all weekly wykop review stats
 *  - Write new post
 *  - Manage subscribers
 *
 * @export
 * @class WykopSummaryBot
 */
@Injectable()
export class WykopSummaryBot {
  private readonly logger = new Logger(WykopSummaryBot.name);

  constructor(
    private readonly wykopStatsService: WykopStatsService,
  ) {}

  get api() {
    return WYKOP_ENV.api;
  }

  /**
   * Posts on wykop.pl summary message every day
   *
   * @memberof WykopSummaryBot
   */
  @Cron(CronExpression.EVERY_WEEK)
  async postSummary() {
    const {
      wykopStatsService,
      logger,
      api,
    } = this;

    const durationAttrs = {
      duration: nthWeeksAgoDuration(1),
    };

    if (!isDevMode()) {
      await wykopStatsService.refreshMetadataReviewsStats(durationAttrs);
    }

    const message = await this.generateSummaryMessage(
      {
        ...durationAttrs,
        ...await wykopStatsService.fetchRanking(durationAttrs),
      },
    );

    if (!message)
      return;

    if (isDevMode())
      logger.warn(`HTML message for wykop.pl: ${message}`);
    else {
      await api.call(
        {
          method: 'POST',
          path: 'Entries/Add',
          body: {
            body: message,
          },
        },
      );
    }
  }

  /**
   * Generate wykop message html
   *
   * @private
   * @param {WykopRanking} ranking
   * @return {Promise<string>}
   * @memberof WykopSummaryBot
   */
  private async generateSummaryMessage(
    {
      tags = [
        '#bookmeter', '#ksiazki', '#czytajzwykopem',
        '#literatura', '#ksiazka', '#bookmeterstats',
      ],
      duration,
      topUpvoted,
    }: SummaryMessageGeneratorAttrs,
  ): Promise<string> {
    const blocks = [];

    if (!R.isEmpty(topUpvoted.items)) {
      blocks.push(
        <BotSummaryTopUpvoted top={topUpvoted.items as WykopOptionalMatchReview[]} />,
      );
    }

    if (R.isEmpty(blocks))
      return null;

    const html = (
      <>
        <BotSummaryHeader duration={duration} />
        {blocks.map(
          (block, blockId) => (
            // eslint-disable-next-line react/no-array-index-key
            <Fragment key={blockId}>
              <br />
              <br />
              {block}
            </Fragment>
          ),
        )}
        <BotMessageFooter>
          {!isDevMode() && tags.join(' ')}
        </BotMessageFooter>
      </>
    );

    return renderJSXToMessage(html);
  }
}
