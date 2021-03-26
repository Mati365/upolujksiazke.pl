import {Injectable} from '@nestjs/common';

import {hydrateTextWithLinks, LinkHydrateAttrs} from '../helpers/hydrateTextWithLinks';
import {BookTagsStatsService} from '../../stats/services';
import {BookTagStatDAO} from '../../stats/dao/BookTagStat.dao';

@Injectable()
export class BookTagsTextHydratorService {
  constructor(
    private readonly bookTagsStats: BookTagsStatsService,
  ) {}

  /**
   * Injects popular tags into text
   *
   * @param {Omit<LinkHydrateAttrs<BookTagStatDAO>, 'items'>} attrs
   * @returns
   * @memberof BookTagsTextHydratorService
   */
  async hydrateTextWithPopularTags(attrs: Omit<LinkHydrateAttrs<BookTagStatDAO>, 'items'>) {
    if (!attrs.text)
      return attrs.text;

    const {bookTagsStats} = this;
    const popularTags = await bookTagsStats.findMostPopularTags();

    return hydrateTextWithLinks(
      {
        items: popularTags,
        ...attrs,
      },
    );
  }
}
