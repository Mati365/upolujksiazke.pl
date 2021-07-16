import {Logger} from '@nestjs/common';
import chalk from 'chalk';
import {InterceptMethod} from '@shared/helpers/decorators/InterceptMethod';

const measureLogger = new Logger('MeasureCallDuration');

export function MeasureCallDuration(name?: string | ((...args: any) => string)) {
  return InterceptMethod((...args: any[]) => {
    const t = Date.now();

    return (result, wrapper) => {
      if (name instanceof Function)
        name = name(...args);

      measureLogger.log(`Called ${chalk.bold(name ?? wrapper.name)} in ${chalk.bold(`${Date.now() - t}ms`)}!`);
    };
  });
}
