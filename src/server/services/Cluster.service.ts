import cluster from 'cluster';
import os from 'os';
import * as R from 'ramda';
import {Injectable} from '@nestjs/common';

import {isDevMode} from '@shared/helpers/isDevMode';

const TOTAL_CORES = os.cpus().length;

@Injectable()
export class ClusterService {
  static clusterize(callback: Function): void {
    if (cluster.isMaster && !isDevMode()) {
      console.info(`🚀 Master server (${process.pid}) is running!`);

      R.times(
        () => cluster.fork(),
        TOTAL_CORES,
      );

      cluster.on('exit', (worker) => {
        console.info(`💀 Worker (${worker.process.pid}) died`);
      });
    } else
      callback();
  }
}
