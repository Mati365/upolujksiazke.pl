import {Inject, Injectable} from '@nestjs/common';
import * as R from 'ramda';

import {memoizeMethod} from '@shared/helpers/decorators/memoizeMethod';
import {LangPack} from '@client/i18n/utils/createLangPack';

export const I18N_OPTIONS = 'I18N_OPTIONS';

export type I18nPackServiceOptions = {
  packs: LangPack,
  fallbackLang?: string,
};

@Injectable()
export class I18nPackService {
  private readonly packs: LangPack;
  private readonly fallbackLang: string;

  constructor(@Inject(I18N_OPTIONS) options: I18nPackServiceOptions) {
    this.packs = options.packs;
    this.fallbackLang = options.fallbackLang ?? 'en';
  }

  getPacks() {
    return this.packs;
  }

  @memoizeMethod
  getAvailableLanguages() {
    return R.keys(this.packs);
  }

  getPackForLang(lang: string) {
    const {packs, fallbackLang} = this;

    return packs[lang] ?? packs[fallbackLang];
  }
}
