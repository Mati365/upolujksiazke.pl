import {MulterModule} from '@nestjs/platform-express';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DynamicModule, Global, Module} from '@nestjs/common';
import {diskStorage} from 'multer';
import * as mime from 'mime-types';

import {genUniqueFilename} from './helpers/genUniqueFilename';

import {AttachmentSubscriber} from './subscribers/Attachment.subscriber';
import {
  AttachmentEntity,
  ImageAttachmentEntity,
} from './entity';

import {
  ATTACHMENTS_OPTIONS,
  AttachmentService,
  ImageAttachmentService,
  AttachmentServiceOptions,
} from './services';

export * from './decorators/FilesForm.decorator';

@Global()
@Module({})
export class AttachmentModule {
  static register(options: AttachmentServiceOptions): DynamicModule {
    options.fileNameGenerator ??= genUniqueFilename;

    const multerModule = MulterModule.register(
      {
        storage: diskStorage(
          {
            destination: options.dest,
            filename: (req, file, cb) => cb(
              null,
              options.fileNameGenerator(
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
        TypeOrmModule.forFeature(
          [
            AttachmentEntity,
            ImageAttachmentEntity,
          ],
        ),
        multerModule,
      ],
      providers: [
        {
          provide: ATTACHMENTS_OPTIONS,
          useValue: options,
        },
        ImageAttachmentService,
        AttachmentService,
        AttachmentSubscriber,
      ],
      exports: [
        ImageAttachmentService,
        AttachmentService,
        multerModule,
      ],
    };
  }
}
