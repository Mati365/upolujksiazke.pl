import {Injectable, NotFoundException} from '@nestjs/common';
import {EntityManager} from 'typeorm';

import {
  paginateQueryBuilder,
  PaginationOptions,
  PaginationResult,
} from '@server/common/helpers/db/pagination';

import {AttachmentEntity} from '../entity/Attachment.entity';
import {CreateAttachmentDto} from '../dto/CreateAttachment.dto';

export const ATTACHMENTS_OPTIONS = 'ATTACHMENTS_OPTIONS';

export type AttachmentServiceOptions = {
  dest: string,
  fileNameGenerator?(extension: string|false): string,
};

@Injectable()
export class AttachmentService {
  /**
   * Remove single attachment
   *
   * @param {number} id
   * @memberof AttachmentService
   */
  async delete(id: number) {
    const attachment = await AttachmentEntity.findOne(id);
    if (!attachment)
      throw new NotFoundException;

    return AttachmentEntity.remove(attachment);
  }

  /**
   * Create single attachment
   *
   * @param {CreateAttachmentDto} dto
   * @returns {Promise<AttachmentEntity>}
   * @memberof AttachmentService
   */
  async create(
    dto: CreateAttachmentDto,
    entityManager: EntityManager = <any> AttachmentEntity,
  ): Promise<AttachmentEntity> {
    return entityManager.save(
      AttachmentEntity.fromDTO(dto),
    );
  }

  /**
   * Return paginated array of attachments
   *
   * @param {PaginationOptions} options
   * @returns {Promise<PaginationResult<AttachmentEntity>>}
   * @memberof ArticleCategoryService
   */
  findAll(options: PaginationOptions): Promise<PaginationResult<AttachmentEntity>> {
    return paginateQueryBuilder(
      AttachmentEntity.createQueryBuilder(),
      {
        ...options,
        unsafe: {
          phraseColumn: 'name',
        },
      },
    );
  }
}
