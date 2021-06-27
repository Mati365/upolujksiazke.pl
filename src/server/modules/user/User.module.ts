import {Global, Module} from '@nestjs/common';
import {UserService} from './User.service';

@Global()
@Module(
  {
    providers: [
      UserService,
    ],
    exports: [
      UserService,
    ],
  },
)
export class UserModule {}
