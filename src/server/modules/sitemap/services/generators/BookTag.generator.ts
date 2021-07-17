import {Injectable} from '@nestjs/common';

import {BookTagsService} from '@server/modules/book/modules/tags/BookTags.service';
import {
  IdNameLinkPair,
  genTagLink,
} from '@client/routes/Links';

import {
  SitemapGenerator,
  SitemapGeneratorResult,
  SitemapGeneratorConfig,
  ChunkSitemapStreamAttrs,
} from './Sitemap.generator';

@Injectable()
export class BookTagSitemapGenerator extends SitemapGenerator {
  constructor(
    private readonly tagsService: BookTagsService,
  ) {
    super();
  }

  override generate(config: SitemapGeneratorConfig): Promise<SitemapGeneratorResult> {
    const streamWriterFn: ChunkSitemapStreamAttrs['streamWriterFn'] = async (stream) => {
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
    };

    return SitemapGenerator.createChunkedSitemapStream(
      {
        ...config,
        indexFileName: 'tags',
        streamWriterFn,
      },
    );
  }
}
