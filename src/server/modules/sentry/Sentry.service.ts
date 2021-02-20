import * as Sentry from '@sentry/node';
import {RewriteFrames} from '@sentry/integrations';
import {
  Client as SentryClient,
  Options as SentryOptions,
  Integration as SentryIntegration,
} from '@sentry/types';

import {Inject, Injectable, Logger, OnModuleDestroy} from '@nestjs/common';
import {Overwrite} from '@shared/types';

export const SENTRY_OPTIONS = 'SENTRY_OPTIONS';

export type SentryServiceOptions = Overwrite<SentryOptions, {
  integrations?: SentryIntegration[],
}>;

@Injectable()
export class SentryService implements OnModuleDestroy {
  private readonly logger = new Logger(SentryService.name);

  constructor(
    @Inject(SENTRY_OPTIONS) readonly options: SentryServiceOptions,
  ) {
    const {logger} = this;

    Sentry.init(
      {
        ...options,
        integrations: [
          new Sentry.Integrations.OnUncaughtException({
            onFatalError: (async (err) => {
              if (err.name === 'SentryError')
                logger.error(err);
              else {
                Sentry.getCurrentHub().getClient<SentryClient<SentryOptions>>().captureException(err);
                process.exit(1);
              }
            }),
          }),
          new Sentry.Integrations.OnUnhandledRejection({mode: 'warn'}),
          new RewriteFrames,
          ...(options.integrations || []),
        ],
      },
    );
  }

  async onModuleDestroy() {
    await this.instance.close(1000);
  }

  get instance() {
    return Sentry;
  }
}