import {normalizeParsedText} from '@server/common/helpers';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '@scrapper/service/shared';
import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';

export class MatrasBookAuthorParser extends WebsiteScrapperParser<CreateBookAuthorDto> {
  /**
   * @inheritdoc
   */
  parse(page: AsyncURLParseResult): CreateBookAuthorDto {
    if (!page)
      return null;

    const {$} = page;
    const $section = $('.mainContainer.pageHome > section:first-child');
    return new CreateBookAuthorDto(
      {
        name: normalizeParsedText($section.find('h2').text()),
        description: normalizeParsedText(
          $section
            .find('.col-lg-8.col-md-8.col-sm-8.col-xs-12.right')
            ?.html(),
        ),
      },
    );
  }
}
