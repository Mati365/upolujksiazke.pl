import React, {ReactNode, useState} from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';

import {DescriptionBox, DescriptionBoxProps} from './DescriptionBox';
import {TextButton} from './TextButton';

type ExpandableDescriptionBoxProps = Omit<DescriptionBoxProps, 'children'> & {
  maxCharactersCount: number,
  text: string,
};

export const ExpandableDescriptionBox = ({maxCharactersCount, text, ...props}: ExpandableDescriptionBoxProps) => {
  const [toggled, setToggled] = useState(false);
  const t = useI18n();

  let content: ReactNode = text;
  if (text.length - maxCharactersCount > 20) {
    const expandTitle = t(`shared.buttons.${toggled ? 'less' : 'more'}`);

    content = (
      <>
        {`${text.substr(0, maxCharactersCount)}${toggled ? '' : '...'}`}

        <span className={c(!toggled && 'is-hidden')}>
          {text.substr(maxCharactersCount, text.length)}
        </span>

        &nbsp;

        <TextButton
          role='button'
          type='primary'
          aria-label={expandTitle}
          onClick={
            () => setToggled(!toggled)
          }
        >
          {expandTitle}
        </TextButton>
      </>
    );
  }

  return (
    <DescriptionBox {...props}>
      {content}
    </DescriptionBox>
  );
};

ExpandableDescriptionBox.displayName = 'ExpandableDescriptionBox';
