import {CanBePromise} from '@shared/types';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {ScrapperGroupChild} from './WebsiteScrappersGroup';

export type BaseWebsiteScrapperConfig = {
  homepageURL?: string,
};

/**
 * Asynchronous parses inputs
 *
 * @export
 * @abstract
 * @class ScrapperParser
 * @extends {ScrapperGroupChild}
 */
export abstract class ScrapperParser<Input, Output, Attr = never> extends ScrapperGroupChild {
  abstract parse(input: Input, attrs?: Attr): CanBePromise<Output>;
}

/**
 * Parses primarily HTML
 *
 * @export
 * @abstract
 * @class WebsiteScrapperParser
 * @extends {ScrapperParser<AsyncURLParseResult, Output, Attr>}
 */
export abstract class WebsiteScrapperParser<
  Output,
  ConfigType extends BaseWebsiteScrapperConfig = BaseWebsiteScrapperConfig,
  Attr = never,
>
  extends ScrapperParser<AsyncURLParseResult, Output, Attr> {
  constructor(
    protected config: ConfigType,
  ) {
    super();
  }
}
