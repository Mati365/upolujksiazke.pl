import {CanBePromise} from '@shared/types';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {ScrapperGroupChild} from './WebsiteScrappersGroup';

export type BasicParseAttrs<T = {}> = T & {
  shallowParse?: boolean,
};

/**
 * Asynchronous parses inputs
 *
 * @export
 * @abstract
 * @class ScrapperParser
 * @extends {ScrapperGroupChild}
 */
export abstract class ScrapperParser<Input, Output, Attr = {}> extends ScrapperGroupChild {
  abstract parse(input: Input, attrs?: BasicParseAttrs<Attr>): CanBePromise<Output>;
}

/**
 * Parses primarily HTML
 *
 * @export
 * @abstract
 * @class WebsiteScrapperParser
 * @extends {ScrapperParser<AsyncURLParseResult, Output, Attr>}
 */
export abstract class WebsiteScrapperParser<Output, Attr = {}>
  extends ScrapperParser<AsyncURLParseResult, Output, Attr> {
}
