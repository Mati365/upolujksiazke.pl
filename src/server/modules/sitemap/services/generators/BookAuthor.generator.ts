import {Injectable} from '@nestjs/common';

import {BookAuthorService} from '@server/modules/book/modules/author/BookAuthor.service';
import {
  IdNameLinkPair,
  genAuthorLink,
} from '@client/routes/Links';

import {
  SitemapGenerator,
  SitemapGeneratorConfig,
} from './Sitemap.generator';

@Injectable()
export class BookAuthorSitemapGenerator implements SitemapGenerator {
  constructor(
    private readonly authorsService: BookAuthorService,
  ) {}

  async generate({stream}: SitemapGeneratorConfig): Promise<void> {
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
  }
}
