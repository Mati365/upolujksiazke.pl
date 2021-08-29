import {Injectable} from '@nestjs/common';

import {CardBookSearchService} from '@server/modules/book/modules/search/service';
import {
  IdSlugBookPair,
  genBookLink,
} from '@client/routes/Links';

import {
  SitemapGenerator,
  SitemapGeneratorConfig,
} from './Sitemap.generator';

@Injectable()
export class BookSitemapGenerator implements SitemapGenerator {
  constructor(
    private readonly bookSearchService: CardBookSearchService,
  ) {}

  async generate({stream}: SitemapGeneratorConfig): Promise<void> {
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
  }
}
