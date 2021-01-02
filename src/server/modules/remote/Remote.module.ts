import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {RemoteRecordEntity} from './entity';
import {RemoteRecordService} from './service/RemoteRecord.service';

@Module(
  {
    imports: [
      TypeOrmModule.forFeature(
        [
          RemoteRecordEntity,
        ],
      ),
    ],
    providers: [
      RemoteRecordService,
    ],
    exports: [
      RemoteRecordService,
    ],
  },
)
export class RemoteModule {}
