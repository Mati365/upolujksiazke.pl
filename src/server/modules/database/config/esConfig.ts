import {EntityIndex} from '@server/modules/elasticsearch/classes/EntityIndex';
import {EsBookIndex} from '@server/modules/book/modules/search/indices/EsBook.index';
import {EsBookCategoryIndex} from '@server/modules/book/modules/category/indices/EsBookCategory.index';

export const ES_INDICES: {new(...args: any[]): EntityIndex<any, any>}[] = [
  EsBookIndex,
  EsBookCategoryIndex,
];
