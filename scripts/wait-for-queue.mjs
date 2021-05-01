import Queue from 'bull';
import * as util from 'util';

const sleep = util.promisify(setTimeout);

for (;;) {
  const {waiting, active, delayed} = await new Queue(
    'scrapper_metadata_loader',
    'redis://127.0.0.1:6379',
  ).getJobCounts();

  const remainJobs = waiting * active * delayed;
  if (remainJobs === 0)
    break;

  console.info(`Remain bull jobs: ${remainJobs}! Waiting!`);
  await sleep(2000);
}
