import {Injectable} from '@nestjs/common';

import {BookTagsService} from '@server/modules/book/modules/tags/BookTags.service';
import {
  IdNameLinkPair,
  genTagLink,
} from '@client/routes/Links';

import {
  SitemapGenerator,
  SitemapGeneratorConfig,
} from './Sitemap.generator';

@Injectable()
export class BookTagSitemapGenerator implements SitemapGenerator {
  constructor(
    private readonly tagsService: BookTagsService,
  ) {}

  async generate({stream}: SitemapGeneratorConfig): Promise<void> {
    const it = this.tagsService.createIteratedQuery<IdNameLinkPair>(
      {
        select: ['t.id', 't.parameterizedName'],
        pageLimit: 50,
      },
    );

    for await (const [, tags] of it) {
      tags.forEach((tag) => {
        stream.write(
          {
            url: genTagLink(tag),
            changefreq: 'daily',
            priority: 0.7,
          },
        );
      });
    }
  }
}
