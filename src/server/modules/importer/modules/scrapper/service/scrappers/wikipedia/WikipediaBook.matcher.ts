import wiki, {Options} from 'wikijs';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {ScrapperMatcher, ScrapperMatcherResult} from '../../shared/ScrapperMatcher';
import {MatchRecordAttrs} from '../../shared/WebsiteScrappersGroup';

export type WikipediaAPIOptions = Options;

export class WikipediaBookMatcher extends ScrapperMatcher<CreateBookDto> {
  constructor(
    private readonly apiOptions: WikipediaAPIOptions,
  ) {
    super();
  }

  async searchRemoteRecord({data}: MatchRecordAttrs<CreateBookDto>): Promise<ScrapperMatcherResult<CreateBookDto>> {
    const {apiOptions} = this;

    try {
      const page = await wiki(apiOptions).page(data.title);
      console.info(page, await (page as any).content());

      return null;
    } catch (e) {
      return null;
    }
  }
}
