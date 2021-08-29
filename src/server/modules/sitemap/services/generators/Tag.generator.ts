import {Injectable} from '@nestjs/common';

import {TagService} from '@server/modules/tag/Tag.service';
import {
  IdNameLinkPair,
  genTagLink,
} from '@client/routes/Links';

import {
  SitemapGenerator,
  SitemapGeneratorConfig,
} from './Sitemap.generator';

@Injectable()
export class TagSitemapGenerator implements SitemapGenerator {
  constructor(
    private readonly tagsService: TagService,
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
