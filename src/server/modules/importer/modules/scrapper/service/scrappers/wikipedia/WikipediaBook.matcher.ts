import wiki, {Options} from 'wikijs';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {ScrapperMatcher, ScrapperMatcherResult} from '../../shared/ScrapperMatcher';

export type WikipediaAPIOptions = Options;

export class WikipediaBookMatcher extends ScrapperMatcher<CreateBookDto> {
  constructor(
    private readonly apiOptions: WikipediaAPIOptions,
  ) {
    super();
  }

  async matchRecord(scrapperInfo: CreateBookDto): Promise<ScrapperMatcherResult<CreateBookDto>> {
    const {apiOptions} = this;

    try {
      const page = await wiki(apiOptions).page(scrapperInfo.title);
      console.info(page, await (page as any).content());

      return null;
    } catch (e) {
      return null;
    }
  }
}
