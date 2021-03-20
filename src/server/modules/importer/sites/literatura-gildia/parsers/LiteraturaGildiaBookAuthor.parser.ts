import {normalizeParsedText} from '@server/common/helpers';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '@scrapper/service/shared';
import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';

export class LiteraturaGildiaBookAuthorParser extends WebsiteScrapperParser<CreateBookAuthorDto> {
  /**
   * @inheritdoc
   */
  parse(page: AsyncURLParseResult): CreateBookAuthorDto {
    if (!page)
      return null;

    const {$} = page;
    return new CreateBookAuthorDto(
      {
        name: normalizeParsedText($('h1').text()),
        description: normalizeParsedText($('.widetext .visible-sentence')?.html()),
      },
    );
  }
}
