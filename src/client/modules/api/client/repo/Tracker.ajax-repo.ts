import {TrackRecord} from '@api/types';
import {TrackerRepo} from '@api/repo';

import {AjaxAPIClientChild} from '../AjaxAPIClientChild';

export class TrackerAjaxRepo extends AjaxAPIClientChild implements TrackerRepo {
  /**
   * Sends tracker hit
   *
   * @param {TrackRecord} record
   * @return {*}  {Promise<void>}
   * @memberof TrackerAjaxRepo
   */
  trackViewsCount(record: TrackRecord): Promise<void> {
    return this.ajax.post(
      {
        path: '/tracker',
        body: record,
      },
    );
  }
}
