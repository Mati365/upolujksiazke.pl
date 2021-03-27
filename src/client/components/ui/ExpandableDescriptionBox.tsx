import React, {ReactNode, useState} from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';
import {getHTMLTextLength, splitHTMLAt} from '@client/helpers/parsers/html';

import {DescriptionBox, DescriptionBoxProps} from './DescriptionBox';
import {TextButton} from './TextButton';

type ExpandableDescriptionBoxProps = Omit<DescriptionBoxProps, 'children'> & {
  maxCharactersCount: number,
  text: string,
  html?: boolean,
};

export const ExpandableDescriptionBox = (
  {
    maxCharactersCount,
    text,
    html,
    ...props
  }: ExpandableDescriptionBoxProps,
) => {
  const [toggled, setToggled] = useState(false);
  const t = useI18n();

  let content: ReactNode = null;
  const length = (
    html
      ? getHTMLTextLength(text)
      : text.length
  );

  if (length - maxCharactersCount > 20) {
    const expandTitle = t(`shared.buttons.${toggled ? 'less' : 'more'}`);

    let chunks: [string, string] = null;
    if (html) {
      chunks = splitHTMLAt(maxCharactersCount, text) as [string, string];
    } else {
      chunks = [
        text.substr(0, maxCharactersCount),
        text.substr(maxCharactersCount, text.length),
      ];
    }

    content = (
      <>
        {(
          html
            ? <span dangerouslySetInnerHTML={{__html: chunks[0]}} />
            : chunks[0]
        )}

        {toggled ? '' : '...'}

        <span
          className={c(
            !toggled && 'is-hidden',
          )}
          {...(
            html
              ? {
                dangerouslySetInnerHTML: {
                  __html: chunks[1],
                },
              }
              : {
                children: chunks[1],
              }
          )}
        />

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
  } else if (html) {
    content = (
      <span dangerouslySetInnerHTML={{__html: text}} />
    );
  } else
    content = text;

  return (
    <DescriptionBox {...props}>
      {content}
    </DescriptionBox>
  );
};

ExpandableDescriptionBox.displayName = 'ExpandableDescriptionBox';
