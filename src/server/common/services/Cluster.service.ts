import cluster from 'cluster';
import {Injectable} from '@nestjs/common';
import * as R from 'ramda';

import {SERVER_ENV} from '@server/constants/env';
import {isDevMode} from '@shared/helpers/isDevMode';

@Injectable()
export class ClusterService {
  static clusterize(callback: Function): void {
    if (cluster.isMaster && !isDevMode() && SERVER_ENV.instances > 1) {
      console.info(`🚀 Master server (${process.pid}) is running!`);

      R.times(
        () => cluster.fork(),
        SERVER_ENV.instances,
      );

      cluster.on('exit', (worker) => {
        console.info(`💀 Worker (${worker.process.pid}) died`);
      });
    } else
      callback();
  }
}
