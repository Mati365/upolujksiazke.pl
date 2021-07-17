import {Injectable} from '@nestjs/common';

import {CardBookSearchService} from '@server/modules/book/modules/search/service';
import {
  IdSlugBookPair,
  genBookLink,
} from '@client/routes/Links';

import {
  SitemapGenerator,
  SitemapGeneratorResult,
  SitemapGeneratorConfig,
  ChunkSitemapStreamAttrs,
} from './Sitemap.generator';

@Injectable()
export class BookSitemapGenerator extends SitemapGenerator {
  constructor(
    private readonly bookSearchService: CardBookSearchService,
  ) {
    super();
  }

  override generate(config: SitemapGeneratorConfig): Promise<SitemapGeneratorResult> {
    const streamWriterFn: ChunkSitemapStreamAttrs['streamWriterFn'] = async (stream) => {
      const it = this.bookSearchService.createIteratedQuery<IdSlugBookPair>(
        {
          select: ['b.id', 'b.parameterizedSlug'],
          pageLimit: 50,
        },
      );

      for await (const [, books] of it) {
        books.forEach((book) => {
          stream.write(
            {
              url: genBookLink(book),
              changefreq: 'weekly',
              priority: 0.8,
            },
          );
        });
      }
    };

    return SitemapGenerator.createChunkedSitemapStream(
      {
        ...config,
        indexFileName: 'books',
        streamWriterFn,
      },
    );
  }
}
