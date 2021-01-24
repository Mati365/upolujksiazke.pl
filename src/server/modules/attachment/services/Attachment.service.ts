import {Injectable} from '@nestjs/common';
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
   * @param {number[]} ids
   * @param {EntityManager} [entityManager=<any> AttachmentEntity]
   * @returns
   * @memberof AttachmentService
   */
  async delete(
    ids: number[],
    entityManager: EntityManager = <any> AttachmentEntity,
  ) {
    return entityManager.remove(
      await AttachmentEntity.findByIds(ids),
    );
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
