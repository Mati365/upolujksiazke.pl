import {Injectable} from '@nestjs/common';

import {BookAuthorService} from '@server/modules/book/modules/author/BookAuthor.service';
import {
  IdNameLinkPair,
  genAuthorLink,
} from '@client/routes/Links';

import {
  SitemapGenerator,
  SitemapGeneratorResult,
  SitemapGeneratorConfig,
  ChunkSitemapStreamAttrs,
} from './Sitemap.generator';

@Injectable()
export class BookAuthorSitemapGenerator extends SitemapGenerator {
  constructor(
    private readonly authorsService: BookAuthorService,
  ) {
    super();
  }

  override generate(config: SitemapGeneratorConfig): Promise<SitemapGeneratorResult> {
    const streamWriterFn: ChunkSitemapStreamAttrs['streamWriterFn'] = async (stream) => {
      const it = this.authorsService.createIteratedQuery<IdNameLinkPair>(
        {
          select: ['c.id', 'c.parameterizedName'],
          pageLimit: 50,
        },
      );

      for await (const [, authors] of it) {
        authors.forEach((author) => {
          stream.write(
            {
              url: genAuthorLink(author),
              changefreq: 'weekly',
              priority: 0.7,
            },
          );
        });
      }
    };

    return SitemapGenerator.createChunkedSitemapStream(
      {
        ...config,
        indexFileName: 'authors',
        streamWriterFn,
      },
    );
  }
}
