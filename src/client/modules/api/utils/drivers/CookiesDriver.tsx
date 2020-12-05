export type CookieSetAttrs = {
  expires: Date,
};

export interface CookiesDriver {
  set(name: string, value: string, attrs: CookieSetAttrs): void;
  get(name: string): any;
  remove(name: string): void;
}
