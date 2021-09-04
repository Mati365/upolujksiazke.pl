import React from 'react';

import {formatDate} from '@shared/helpers';
import {Duration} from '@shared/types';

type BotSummaryHeaderProps = {
  duration: Duration,
};

export const BotSummaryHeader = ({duration}: BotSummaryHeaderProps) => (
  <>
    {'Statystyki tagu #bookmeter z okresu '}
    <strong>
      {formatDate(duration.begin)}
    </strong>
    {' - '}
    <strong>
      {formatDate(duration.end)}
    </strong>
    :
  </>
);
