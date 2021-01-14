import {MulterModule} from '@nestjs/platform-express';
import {TypeOrmModule} from '@nestjs/typeorm';
import {diskStorage} from 'multer';
import * as mime from 'mime-types';

import {SERVER_ENV} from '@server/constants/env';

import {DynamicModule, Module} from '@nestjs/common';
import {AttachmentEntity} from './Attachment.entity';
import {AttachmentService} from './Attachment.service';

import {genUniqueFilename} from './helpers/genUniqueFilename';

export * from './decorators/FilesForm.decorator';

@Module({})
export class AttachmentModule {
  static register(): DynamicModule {
    const multerModule = MulterModule.register(
      {
        storage: diskStorage(
          {
            destination: SERVER_ENV.cdn.localPath,
            filename: (req, file, cb) => cb(
              null,
              genUniqueFilename(
                mime.extension(file.mimetype),
              ),
            ),
          },
        ),
      },
    );

    return {
      module: AttachmentModule,
      imports: [
        TypeOrmModule.forFeature([AttachmentEntity]),
        multerModule,
      ],
      providers: [
        AttachmentService,
      ],
      exports: [
        multerModule,
      ],
    };
  }
}
