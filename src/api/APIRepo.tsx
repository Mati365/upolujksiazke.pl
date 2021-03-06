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

export interface APIReadable<T, F> {
  find?(item: T): Promise<T>;
  findOne?(id: ID): Promise<T>;
  findAll?(filters?: APIPaginationFilters<F>): Promise<APIPaginationResult<T, F>>;
  findPlainList?(filters?: APIPaginationFilters<F>): Promise<T[]>;
  count?(filters?: APIPaginationFilters<F>): Promise<number>;
}

export interface APIRepo<T, F = {}> extends APIWritable<T>, APIReadable<T, F> {}
