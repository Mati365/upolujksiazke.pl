import {EntityIndex} from '@server/modules/elasticsearch/classes/EntityIndex';
import * as Index from '@server/modules/book/modules/search/indices';

export const ES_INDICES: {new(...args: any[]): EntityIndex<any, any>}[] = [
  Index.EsBookIndex,
  Index.EsBookCategoryIndex,
];
