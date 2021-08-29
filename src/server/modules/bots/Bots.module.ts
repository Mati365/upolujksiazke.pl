import {Module} from '@nestjs/common';
import {WykopBotModule} from './sites';

@Module(
  {
    imports: [
      WykopBotModule,
    ],
  },
)
export class BotsModule {}
