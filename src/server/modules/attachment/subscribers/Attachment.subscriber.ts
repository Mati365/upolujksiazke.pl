import * as fs from 'fs/promises';
import * as path from 'path';
import {Inject, Injectable} from '@nestjs/common';
import {InjectConnection} from '@nestjs/typeorm';
import {
  Connection, EntitySubscriberInterface,
  EventSubscriber, RemoveEvent,
} from 'typeorm';

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

    await fs.unlink(
      path.join(options.dest, event.entity.file),
    );
  }
}
