import {CanBeArray, ID} from '@shared/types';
import {
  APIPaginationFilters,
  APIPaginationResult,
} from './APIClient';

export interface APIWritable<T> {
  create?(item: Partial<T>): Promise<T>;
  update?(item: CanBeArray<Partial<T>>): Promise<Partial<T>>;
  delete?(id: ID): Promise<void>;
}

export interface APIReadable<T, F, A = {}> {
  find?(item: T): Promise<T>;
  findOne?(id: ID, attrs?: A): Promise<T>;
  findAll?(filters?: APIPaginationFilters<F>): Promise<APIPaginationResult<T>>;
  findPlainList?(filters?: APIPaginationFilters<F>): Promise<T[]>;
  count?(filters?: APIPaginationFilters<F>): Promise<number>;
}

export interface APIRepo<T, F = {}, A = {}> extends APIWritable<T>, APIReadable<T, F, A> {}
