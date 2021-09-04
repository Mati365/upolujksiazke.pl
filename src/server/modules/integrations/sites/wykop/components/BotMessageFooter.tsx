import React, {ReactNode} from 'react';
import {ENV} from '../constants/wykopEnv';

type BotMessageFooterProps = {
  children?: ReactNode,
};

export const BotMessageFooter = ({children}: BotMessageFooterProps) => (
  <>
    <br />
    <br />
    ---------
    <br />
    Wygenerowane przez bota książkowego :) Jeśli masz sugestie / pomysły / uwagi /
    chcesz wspomóc prace nad nim pisz na PW. Github:
    {' '}
    <a href={ENV.shared.repo.url}>
      <strong>
        Kod źródłowy witryny
      </strong>
    </a>

    {children && (
      <>
        <br />
        {children}
      </>
    )}
  </>
);
