import {forEachObjIndexed} from 'ramda';

type MemCacheEntry = {
  timeout: number,
  data: any,
};

export interface CacheStore {
  del(key: string): this;
  clear(): this;
  set<T = any>(key: string, value: T): T;
  get<T = any>(key: string): T;
}

export interface KeyExpirableCacheStore extends CacheStore {
  setex<T = any>(key: string, value: T, seconds?: number): T;
}

export class MemCache implements KeyExpirableCacheStore {
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

  set<T>(key: string, value: T) {
    return this.setex(key, value);
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
