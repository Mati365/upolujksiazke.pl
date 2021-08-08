import {Injectable} from '@nestjs/common';

import {groupRawMany} from '@server/common/helpers/db';

import {TagEntity} from '@server/modules/tag/Tag.entity';
import {BrochureGroupedSelectAttrs} from '../shared/types';

@Injectable()
export class BrochureTagsService {
  /**
   * Return all tags of brochures
   *
   * @param {BrochureGroupedSelectAttrs} attrs
   * @return {Promise<Record<string, TagEntity[]>>}
   * @memberof BookTagsService
   */
  async findBrochuresTags(
    {
      brochuresIds,
      select = [
        't.id as "id"',
        't.name as "name"',
        't.parameterizedName as "parameterizedName"',
      ],
    }: BrochureGroupedSelectAttrs,
  ): Promise<Record<string, TagEntity[]>> {
    const items = await (
      TagEntity
        .createQueryBuilder('t')
        .innerJoin(
          'brochure_tags_tag',
          'bt',
          'bt.brochureId in (:...brochuresIds) and bt.tagId = t.id',
          {
            brochuresIds,
          },
        )
        .select(
          [
            'bt.brochureId as "brochureId"',
            ...select,
          ],
        )
        .getRawMany()
    );

    return groupRawMany(
      {
        items,
        key: 'brochureId',
        mapperFn: (item) => new TagEntity(item),
      },
    );
  }

  /**
   * Find single brochure tags
   *
   * @param {number} brochureId
   * @return {Promise<TagEntity[]>}
   * @memberof BookTagsService
   */
  async findBrochureTags(brochureId: number): Promise<TagEntity[]> {
    return (await this.findBrochuresTags(
      {
        brochuresIds: [brochureId],
      },
    ))[brochureId] || [];
  }
}
