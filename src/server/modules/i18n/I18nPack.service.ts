import {Inject, Injectable} from '@nestjs/common';
import * as R from 'ramda';

import {MemoizeMethod} from '@shared/helpers/decorators/MemoizeMethod';
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
    this.fallbackLang = options.fallbackLang ?? 'pl';
  }

  getPacks() {
    return this.packs;
  }

  @MemoizeMethod
  getAvailableLanguages() {
    return R.keys(this.packs);
  }

  getPackForLang(lang: string) {
    const {packs, fallbackLang} = this;

    return packs[lang] ?? packs[fallbackLang];
  }
}
