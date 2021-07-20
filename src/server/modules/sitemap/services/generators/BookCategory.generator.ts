import {Injectable} from '@nestjs/common';

import {genBookCategoryLink} from '@client/routes/Links';

import {BookCategoryService} from '@server/modules/book/modules/category';
import {BookCategoryRecord} from '@api/types';

import {
  SitemapGenerator,
  SitemapGeneratorConfig,
} from './Sitemap.generator';

@Injectable()
export class BookCategorySitemapGenerator implements SitemapGenerator {
  constructor(
    private readonly categoriesService: BookCategoryService,
  ) {}

  async generate({stream}: SitemapGeneratorConfig): Promise<void> {
    const it = this.categoriesService.createIteratedQuery<BookCategoryRecord>(
      {
        select: ['c.id', 'c.parameterizedName', 'c.root', 'c.name'],
        pageLimit: 50,
      },
    );

    for await (const [, categories] of it) {
      categories.forEach((category) => {
        stream.write(
          {
            url: genBookCategoryLink(category),
            changefreq: 'weekly',
            priority: 0.7,
          },
        );
      });
    }
  }
}
