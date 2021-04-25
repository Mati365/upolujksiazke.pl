import {Module, forwardRef} from '@nestjs/common';

import {APIModule} from '../../API.module';
import {APIBooksController} from './APIBooks.controller';

@Module(
  {
    imports: [
      forwardRef(() => APIModule),
    ],
    controllers: [
      APIBooksController,
    ],
  },
)
export class APIv1Module {}
