import {EntityIndex} from '@server/modules/elasticsearch/classes/EntityIndex';
import {EsBookIndex} from '@server/modules/book/modules/search/indices/EsBook.index';

export const ES_INDICES: {new(...args: any[]): EntityIndex<any, any>}[] = [
  EsBookIndex,
];
