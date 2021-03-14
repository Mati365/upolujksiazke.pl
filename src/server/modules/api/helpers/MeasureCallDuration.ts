import {InterceptMethod} from '@shared/helpers/decorators/InterceptMethod';
import {Logger} from '@nestjs/common';
import chalk from 'chalk';

const measureLogger = new Logger('MeasureCallDuration');

export function MeasureCallDuration() {
  return InterceptMethod(() => {
    const t = Date.now();

    return (result, wrapper) => {
      measureLogger.log(`Called ${chalk.bold(wrapper.name)} in ${chalk.bold(`${Date.now() - t}ms`)}!`);
    };
  });
}
