import {CacheStore} from './MemCache';

class LRUItem {
  constructor(
    public readonly data: any,
    public key: string,
    public prev: LRUItem,
    public next: LRUItem,
    public readonly time: number = Date.now(),
  ) {}
}

export type LRUCacheConfig = {
  maxSize?: number,
  maxAge?: number,
};

export class LRUMemCache implements CacheStore {
  private readonly maxSize: number;
  private readonly maxAge: number;

  private size: number = 0;
  private map: Record<string, LRUItem> = {};
  private oldest: LRUItem = null;
  private newest: LRUItem = null;

  constructor(
    {
      maxSize = 5,
      maxAge,
    }: LRUCacheConfig,
  ) {
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }

  /**
   * Removes all objects
   *
   * @returns {this}
   * @memberof LRUMemCache
   */
  clear(): this {
    this.size = 0;
    this.map = {};
    this.oldest = null;
    this.newest = null;
    return this;
  }

  /**
   * Appends value to stack
   *
   * @template T
   * @param {string} key
   * @param {T} value
   * @returns {T}
   * @memberof LRUMemCache
   */
  set<T = any>(key: string, value: T): T {
    const {map, newest, maxSize} = this;
    const item = new LRUItem(value, key, newest, null);

    if (newest) {
      newest.next = item;
      item.prev = newest;
    }

    map[key] = item;

    this.newest = item;
    if (!this.size)
      this.oldest = item;

    this.size++;
    if (this.size > maxSize)
      this.dropOldest();

    return value;
  }

  /**
   * Moves element to on top stack and gets value
   *
   * @template T
   * @param {string} key
   * @returns {T}
   * @memberof LRUMemCache
   */
  get<T = any>(key: string): T {
    if (key in this.map)
      return this.markAsRead(key);

    return null;
  }

  /**
   * Deletes single item from LRU
   *
   * @param {string} key
   * @returns {this}
   * @memberof LRUMemCache
   */
  del(key: string): this {
    const {map} = this;

    if (key in map) {
      const item = map[key];
      delete map[key];

      if (item.next) {
        item.next.prev = item.prev;
        if (!item.prev)
          this.oldest = item.next;
      }

      if (item.prev) {
        item.prev.next = item.next;
        if (!item.next)
          this.newest = item.prev;
      }

      this.size--;
    }

    return this;
  }

  /**
   * Removes oldest item and removes it from map
   *
   * @private
   * @returns
   * @memberof LRUMemCache
   */
  private dropOldest() {
    const {oldest, map} = this;

    if (!oldest)
      return;

    delete map[oldest.key];

    if (oldest.next) {
      oldest.next.prev = null;
      this.oldest = oldest.next;
    } else
      this.oldest = null;

    this.size--;
  }

  /**
   * Move readed item to newest
   *
   * @private
   * @template T
   * @param {string} key
   * @returns {T}
   * @memberof LRUMemCache
   */
  private markAsRead<T>(key: string): T {
    const {map, newest, maxAge} = this;
    const item = map[key];

    if (item.time && maxAge && Date.now() >= item.time + maxAge) {
      this.del(key);
      return null;
    }

    if (newest !== item) {
      if (item.next)
        item.next.prev = item.prev;

      if (item.prev)
        item.prev.next = item.next;

      if (item.next && !item.next.prev)
        this.oldest = item.next;

      if (newest)
        newest.next = item;

      item.prev = newest;
      item.next = null;
      this.newest = item;
    }

    return item.data;
  }

  /**
   * Iterates over collection
   *
   * @param {(item: LRUItem) => void} fn
   * @memberof LRUMemCache
   */
  forEach(fn: (item: LRUItem) => void) {
    let head = this.oldest;

    while (head) {
      fn(head);
      head = head.next;
    }
  }
}
