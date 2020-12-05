import React from 'react';
import {Helmet} from 'react-helmet';

import {useI18n} from '@client/i18n/hooks/useI18n';

export const HomeRoute = () => {
  const t = useI18n();

  return (
    <>
      <Helmet>
        <title>
          {t('home.meta.title')}
        </title>
      </Helmet>

      <div>
        ABC
      </div>
    </>
  );
};

HomeRoute.displayName = 'HomeRoute';
