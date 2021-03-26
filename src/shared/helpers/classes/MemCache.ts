import {forEachObjIndexed} from 'ramda';

type MemCacheEntry = {
  timeout: number,
  data: any,
};

export interface CacheStore {
  del(key: string): this;
  clear(): this;
  setex<T = any>(key: string, value: T, seconds?: number): T;
  get<T = any>(key: string): T;
}

export class MemCache implements CacheStore {
  memory: {[key: string]: MemCacheEntry} = {};

  constructor(
    public readonly defaultKeyExpire: number = 5000,
  ) {}

  del(key: string) {
    const {memory} = this;
    const oldKey = memory[key];

    if (oldKey) {
      clearTimeout(oldKey.timeout);
      delete memory[key];
    }

    return this;
  }

  setex<T = any>(key: string, value: T, seconds: number = this.defaultKeyExpire) {
    this.del(key);

    const timeoutHandle = <any> setTimeout(
      () => this.del(key),
      seconds * 1000,
    );

    this.memory[key] = {
      timeout: timeoutHandle,
      data: value,
    };

    return value;
  }

  get<T = any>(key: string): T {
    const {data} = this.memory[key] || {data: null};
    return data;
  }

  clear() {
    forEachObjIndexed(
      ({timeout}) => {
        clearTimeout(timeout);
      },
      this.memory,
    );

    this.memory = {};
    return this;
  }
}
