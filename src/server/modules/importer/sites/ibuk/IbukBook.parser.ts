import {extractTableRowsMap} from '@scrapper/helpers';
import {
  normalizeISBN,
  normalizeParsedText,
  normalizePrice,
} from '@server/common/helpers';

import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookCategoryDto} from '@server/modules/book/modules/category/dto/CreateBookCategory.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';

import {
  LANGUAGE_TRANSLATION_MAPPINGS,
  BookAvailabilityParser,
} from '@importer/kinds/scrappers/Book.scrapper';

import {BookType} from '@server/modules/book/modules/release/BookRelease.entity';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '../../modules/scrapper/service/shared';

export class IbukBookParser
  extends WebsiteScrapperParser<CreateBookDto>
  implements BookAvailabilityParser<AsyncURLParseResult> {
  /**
   * @inheritdoc
   */
  parseAvailability({$, url}: AsyncURLParseResult) {
    const $section = $('#pageContent section.item');
    const $content = $section.find('.row__stars .col-xs-12.pad-left.pad-right');
    const $priceSidebar = $section.find('.wrapper-max .row > .pad-right');

    return Promise.resolve(
      {
        result: [
          new CreateBookAvailabilityDto(
            {
              totalRatings: +$content.find('.item__how-many').text().match(/(\d+)/)?.[1] || null,
              avgRating: +$content.find('.rating-value.book-stars').val() || null,
              remoteId: $content.find('[data-bookid]:first').data('bookid'),
              price: normalizePrice($priceSidebar.find('.item-accept__new > span').text())?.price,
              prevPrice: normalizePrice($priceSidebar.find('.item-accept__old > span').text())?.price,
              url,
            },
          ),
        ],
      },
    );
  }

  /**
   * @inheritdoc
   */
  /* eslint-disable @typescript-eslint/dot-notation */
  async parse(bookPage: AsyncURLParseResult) {
    if (!bookPage)
      return null;

    const {$} = bookPage;
    const $section = $('#pageContent section.item');
    const $content = $section.find('.row__stars .col-xs-12.pad-left.pad-right');
    const basicProps = extractTableRowsMap(
      $,
      $('#pageContent section.book-desc .col-xs-12 .table > tbody > tr').toArray(),
    );

    if (!basicProps['isbn-13'])
      return null;

    const authors = $content.find('.item__author[itemtype="https://schema.org/Person"]').toArray().map(
      (author) => new CreateBookAuthorDto(
        {
          name: normalizeParsedText($(author).text()),
        },
      ),
    );

    const release = new CreateBookReleaseDto(
      {
        type: BookType.EBOOK,
        title: $content.find('h1').text(),
        lang: LANGUAGE_TRANSLATION_MAPPINGS[basicProps['język publikacji']?.toLowerCase()],
        description: normalizeParsedText($('#js_desc_text').parent().html()),
        totalPages: +basicProps['liczba stron'] || null,
        isbn: normalizeISBN(basicProps['isbn-13']),
        edition: normalizeParsedText(basicProps['numer wydania'] || basicProps['wydanie']),
        availability: (await this.parseAvailability(bookPage)).result,
        publisher: new CreateBookPublisherDto(
          {
            name: normalizeParsedText($content.find('.item__publisher[itemprop="publisher"]').text()),
          },
        ),
        cover: new CreateImageAttachmentDto(
          {
            originalUrl: $section.find('.item__cover .item__img .img-responsive[itemprop="image"]').attr('src'),
          },
        ),
      },
    );

    return new CreateBookDto(
      {
        authors,
        defaultTitle: release.title,
        releases: [
          release,
        ],
        tags: $('#js_desc_tags li').toArray().map((item) => $(item).text()),
        categories: (
          $('#js_desc_path > ul.book-desc__tag-path > li > a')
            .toArray()
            .map(
              (name) => new CreateBookCategoryDto(
                {
                  name: $(name).text(),
                },
              ),
            )
        ),
      },
    );
  }
  /* eslint-enable @typescript-eslint/dot-notation */
}
