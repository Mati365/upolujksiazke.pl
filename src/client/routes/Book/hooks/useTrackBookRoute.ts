import * as R from 'ramda';
import {useEffect} from 'react';

import {useAjaxAPIClient} from '@client/modules/api/client/hooks/useAjaxAPIClient';
import {TrackerRecordType} from '@shared/enums';

export function useTrackBookRoute(
  {
    recordId,
  }: {
    recordId: number,
  },
) {
  const api = useAjaxAPIClient();

  useEffect(
    () => {
      if (R.isNil(recordId))
        return;

      api.repo.tracker.trackViewsCount(
        {
          type: TrackerRecordType.BOOK,
          recordId,
        },
      );
    },
    [],
  );
}
