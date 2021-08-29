import React from 'react';

import {ENV} from '@client/constants/env';
import {useI18n} from '@client/i18n';

import {UndecoratedLink} from '@client/components/ui';
import {GithubIcon} from '@client/components/svg';

export const RepoRibbon = () => {
  const t = useI18n();
  const {url, hidden} = ENV.shared.repo;

  if (hidden)
    return null;

  return (
    <UndecoratedLink
      className='c-repo-ribbon'
      href={url}
      target='_blank'
    >
      <span className='c-repo-ribbon__title'>
        {t('repo.badge')}
        <GithubIcon />
      </span>
    </UndecoratedLink>
  );
};

RepoRibbon.displayName = 'RepoRibbon';
