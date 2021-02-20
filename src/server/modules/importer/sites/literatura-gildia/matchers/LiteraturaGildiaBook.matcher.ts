import * as R from 'ramda';

import slugify from 'slugify';
import {underscoreParameterize} from '@shared/helpers/parameterize';
import {fuzzyFindBookAnchor} from '@scrapper/helpers/fuzzyFindBookAnchor';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {ScrapperMatcherResult, WebsiteScrapperMatcher} from '@scrapper/service/shared/ScrapperMatcher';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {BookShopScrappersGroupConfig} from '@importer/kinds/scrappers/BookShop.scrapper';
import {ScrapperMetadataKind} from '@scrapper/entity';

export class LiteraturaGildiaBookMatcher extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig> {
  /**
   * @inheritdoc
   */
  async searchRemoteRecord({data}: MatchRecordAttrs<CreateBookDto>): Promise<ScrapperMatcherResult<CreateBookDto>> {
    return {
      result: await this.parsers[ScrapperMetadataKind.BOOK].parse(
        (await this.directSearch(data)) || (await this.searchByFirstLetter(data)),
        {
          shallowParse: true,
        },
      ),
    };
  }

  /**
   * Skips search phrase and try to build that links directly to book
   *
   * @private
   * @param {CreateBookDto} {authors, releases}
   * @returns
   * @memberof LiteraturaGildiaBookMatcher
   */
  private directSearch({authors, title}: CreateBookDto) {
    const author = authors[0].name;
    if (!author || !title)
      return null;

    return this.fetchPageByPath(
      `tworcy/${underscoreParameterize(author)}/${underscoreParameterize(title)}`,
    );
  }

  /**
   * Tries to find book using internal website search engine
   *
   * @private
   * @param {CreateBookDto} {title}
   * @returns
   * @memberof LiteraturaGildiaBookMatcher
   */
  private async searchByFirstLetter({title}: CreateBookDto) {
    const $ = (
      await this.fetchPageByPath(`ksiazki,${LiteraturaGildiaBookMatcher.getFilterFirstLetter(title)}`)
    )?.$;

    if (!$)
      return null;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('#yui-main .content ul.long-list > li > a'),
        book: {
          title,
        },
        anchorSelector: (anchor) => ({
          title: $(anchor).text(),
        }),
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor).attr('href'),
    );
  }

  /**
   * Generates link for letter based search
   *
   * @see {@link https://www.literatura.gildia.pl/ksiazki,L1}
   *
   * @static
   * @param {string} title
   * @returns
   * @memberof LiteraturaGildiaBookMatcher
   */
  public static getFilterFirstLetter(title: string) {
    const letter = R.toUpper(title[0]);
    switch (letter) {
      case 'N': case 'E': case 'A': case 'C': case 'L': case 'O': case 'S': case 'Z':
        return `${letter}0`;

      case 'Ń': case 'Ę': case 'Ą': case 'Ć': case 'Ł': case 'Ó': case 'Ś': case 'Ż':
        return `${slugify(letter)}1`;

      case 'Ź':
        return `${letter}2`;

      default:
        return Number.isNaN(+letter) ? letter : '0';
    }
  }
}
