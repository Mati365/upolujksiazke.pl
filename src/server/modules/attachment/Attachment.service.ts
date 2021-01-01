import {Injectable, NotFoundException} from '@nestjs/common';

import {
  paginateQueryBuilder,
  PaginationOptions,
  PaginationResult,
} from '@server/common/helpers/db/pagination';

import {AttachmentEntity} from './Attachment.entity';
import {CreateAttachmentDto} from './dto/CreateAttachment.dto';

@Injectable()
export class AttachmentService {
  /**
   * Remove single attachment
   *
   * @param {number} id
   * @memberof AttachmentService
   */
  async delete(id: number) {
    const article = await AttachmentEntity.findOne(id);

    if (!article)
      throw new NotFoundException;

    return AttachmentEntity.remove(article);
  }

  /**
   * Create single attachment
   *
   * @param {CreateAttachmentDto} dto
   * @returns {Promise<AttachmentEntity>}
   * @memberof AttachmentService
   */
  async create(dto: CreateAttachmentDto): Promise<AttachmentEntity> {
    return AttachmentEntity.save(
      AttachmentEntity.create(
        {
          name: dto.name,
          ...dto.file,
        },
      ),
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
