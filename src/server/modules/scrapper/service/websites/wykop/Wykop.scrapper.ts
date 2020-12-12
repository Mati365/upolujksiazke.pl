import {BookReviewDto} from '@server/modules/book-review/BookReview.dto';
import {HTMLParserAttrs, HTMLScrapper, HTMLScrapperResult} from '../../shared/HTMLScrapper';

/**
 * Collects reviews from wykop.pl
 *
 * @export
 * @class WykopScrapper
 * @extends {HTMLScrapper<BookReviewDto[]>}
 */
export class WykopScrapper extends HTMLScrapper<BookReviewDto[]> {
  static BOOK_TAG_URL = 'https://www.wykop.pl/tag/bookmeter/';

  constructor() {
    super(WykopScrapper.BOOK_TAG_URL);
  }

  protected parsePage({element}: HTMLParserAttrs): Promise<HTMLScrapperResult<BookReviewDto[]>> {
    const items = element.querySelectorAll('#itemsStream .entry');

    console.info(items[0], items[0].innerHTML);
    return Promise.resolve(
      {
        result: [
          null,
        ],
        ptr: {
          nextUrl: null,
        },
      },
    );
  }
}
