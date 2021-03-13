import React, {ReactNode, useMemo, useContext, useState} from 'react';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import * as R from 'ramda';

import {LANG_SETTING_COOKIE} from '@client/constants/cookies';

import {useUpdateEffect} from '@client/hooks/useUpdateEffect';
import {createLangPack, LangPack, Lang, LangTranslateFn} from './utils/createLangPack';

type LangProviderProps = {
  lang: Lang,
  fallbackLang: string,
  translations: LangPack,
  children: ReactNode,
};

export const I18nContext = React.createContext(null);

export const useLangContext = () => useContext<LangTranslateFn>(I18nContext);

export const ProvideI18n = ({
  children, translations,
  lang, fallbackLang,
}: LangProviderProps) => {
  const [currentLang, setCurrentLang] = useState<string>(lang);
  const translator = useMemo(
    () => {
      const t = createLangPack(translations).createTranslator(currentLang, fallbackLang);

      t.supportedLangs = R.keys(translations) as string[];
      t.lang = currentLang as Lang;
      t.setCurrentLang = setCurrentLang;

      return t;
    },
    [currentLang, translations],
  );

  // write cookie cache
  useUpdateEffect(
    () => {
      if (currentLang)
        Cookies.set(LANG_SETTING_COOKIE, currentLang, {expires: new Date('2300-01-01')});
    },
    [currentLang],
  );

  return (
    <I18nContext.Provider
      value={translator}
      key={translator.lang}
    >
      {children}
    </I18nContext.Provider>
  );
};

ProvideI18n.displayName = 'ProvideI18n';

ProvideI18n.propTypes = {
  translations: PropTypes.objectOf(PropTypes.any),
  lang: PropTypes.string,
  fallbackLang: PropTypes.string,
};

ProvideI18n.defaultProps = {
  translations: {},
  lang: 'pl',
  fallbackLang: 'pl',
};
