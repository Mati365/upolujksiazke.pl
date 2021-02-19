import * as R from 'ramda';

import {normalizeParsedText} from '@server/common/helpers';

import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '@scrapper/service/shared';

export class LiteraturaGildiaBookPublisherParser extends WebsiteScrapperParser<CreateBookPublisherDto> {
  /**
   * @inheritdoc
   */
  parse(page: AsyncURLParseResult): CreateBookPublisherDto {
    if (!page)
      return null;

    const {$} = page;
    const $content = $('#yui-main .widetext');
    const segments = $content.find('p').toArray().map((item) => $(item).text());
    const [
      descriptionSegments,
      propsSegments,
    ] = (
      R
        .splitWhen(
          (line: string) => (
            line.startsWith('ul.')
              || line.includes('Kontakt:')
              || line.includes('Dane teleadresowe')
          ),
          segments,
        )
        .map(
          (items) => items.join('\n'),
        )
    );

    return new CreateBookPublisherDto(
      {
        name: normalizeParsedText($('h1').text()),
        description: descriptionSegments,
        address: propsSegments.match(/^\s*ul.\s*(.*)$/m)?.[1],
        email: propsSegments.match(/^\s*e-mail:\s*(.*)$/m)?.[1].trim(),
      },
    );
  }
}
