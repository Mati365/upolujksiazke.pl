import {Global, Module} from '@nestjs/common';
import {ReactionsService} from './Reactions.service';

@Global()
@Module(
  {
    providers: [
      ReactionsService,
    ],
    exports: [
      ReactionsService,
    ],
  },
)
export class ReactionsModule {}
