import Cookies from 'js-cookie';
import {CookiesDriver, CookieSetAttrs} from './CookiesDriver';

export class WebCookiesDriver implements CookiesDriver {
  get(name: string): any {
    return Cookies.get(name);
  }

  set(name: string, value: string, attrs: CookieSetAttrs): void {
    Cookies.set(name, value, attrs);
  }

  remove(name: string): void {
    Cookies.remove(name);
  }
}
