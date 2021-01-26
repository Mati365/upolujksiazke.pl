import * as fs from 'fs/promises';
import * as path from 'path';
import {Inject, Injectable} from '@nestjs/common';
import {InjectConnection} from '@nestjs/typeorm';
import {
  Connection, EntitySubscriberInterface,
  EventSubscriber, RemoveEvent,
} from 'typeorm';

import {
  isEmptyDirAsync,
  removeDirIfExistsAsync,
} from '@server/common/helpers/dirUtils';

import {AttachmentEntity} from '../entity/Attachment.entity';
import {
  AttachmentServiceOptions,
  ATTACHMENTS_OPTIONS,
} from '../services/Attachment.service';

@Injectable()
@EventSubscriber()
export class AttachmentSubscriber implements EntitySubscriberInterface<AttachmentEntity> {
  constructor(
    @InjectConnection() readonly connection: Connection,
    @Inject(ATTACHMENTS_OPTIONS) private readonly options: AttachmentServiceOptions,
  ) {
    connection.subscribers.push(this as any);
  }

  listenTo() {
    return AttachmentEntity;
  }

  async afterRemove(event: RemoveEvent<AttachmentEntity>) {
    const {options} = this;

    try {
      const filePath = event.entity.file;
      const fullPath = path.join(options.dest, filePath);
      const fileFolders = filePath.substring(0, filePath.lastIndexOf('/')).split('/');

      await fs.unlink(fullPath);
      for (;;) {
        const folder = path.join(options.dest, ...fileFolders);
        if (await isEmptyDirAsync(folder)) {
          await removeDirIfExistsAsync(folder);
          fileFolders.pop();
        } else
          break;
      }
    } catch (e) {
      console.error(e);
    }
  }
}
