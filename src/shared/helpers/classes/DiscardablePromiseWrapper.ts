export class DiscardablePromiseWrapper<K> {
  public promise: Promise<K>;

  constructor(
    promise: Promise<K>,
    public discarded: boolean = false,
  ) {
    this.promise = new Promise<K>((resolve, reject) => {
      promise
        .then((...args) => {
          if (this.discarded)
            return Promise.reject(new Error('Discarded'));

          return resolve(...args);
        })
        .catch((e) => {
          if (this.discarded)
            return;

          reject(e);
        });
    });
  }

  static fork<P>(promise: Promise<P>): DiscardablePromiseWrapper<P> {
    return new DiscardablePromiseWrapper<P>(promise);
  }
}
