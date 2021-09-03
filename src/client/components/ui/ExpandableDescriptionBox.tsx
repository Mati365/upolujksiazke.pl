import React, {ReactNode, useState, useMemo} from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';
import {
  getHTMLTextLength,
  splitHTMLAt,
  wrapHTMLSpoilers,
} from '@shared/helpers/html';

import {DescriptionBox, DescriptionBoxProps} from './DescriptionBox';
import {TextButton} from './TextButton';

export type ExpandableDescriptionBoxProps = Omit<DescriptionBoxProps, 'children'> & {
  maxCharactersCount: number,
  text: string,
  html?: boolean,
  renderHiddenChunk?: boolean,
  children?: ReactNode,
  moreButtonRenderFn?(
    attrs: {
      expandTitle: string,
      toggled: boolean,
      setToggled: (value: boolean) => void,
    },
  ): void,
};

export const ExpandableDescriptionBox = (
  {
    maxCharactersCount,
    text,
    html,
    moreButtonRenderFn,
    children,
    renderHiddenChunk = true,
    ...props
  }: ExpandableDescriptionBoxProps,
) => {
  const [toggled, setToggled] = useState(false);
  const t = useI18n();

  let content: ReactNode = null;
  const hydratedText = useMemo(
    () => {
      if (!html)
        return text;

      return wrapHTMLSpoilers(
        {
          buttonTitle: t('shared.buttons.show_spoiler'),
          text,
        },
      );
    },
    [html, text],
  );

  const length = (
    html
      ? getHTMLTextLength(hydratedText)
      : hydratedText.length
  );

  const onClickHTML: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    const element = e.target as HTMLElement;
    if (element?.className === 'c-spoiler__btn') {
      element.classList.add('is-hidden');
      element
        .parentNode
        .querySelector('.c-spoiler__content')
        .classList.add('is-expanded');
    }
  };

  const renderFullHTML = (innerHTML: string = hydratedText) => (
    <span
      className='c-description-box__text'
      dangerouslySetInnerHTML={{
        __html: innerHTML,
      }}
      onClick={onClickHTML}
    />
  );

  if (length - maxCharactersCount > 20) {
    const expandTitle = t(`shared.buttons.${toggled ? 'less' : 'more'}`);

    let chunks: string[] = null;
    if (html)
      chunks = splitHTMLAt(
        maxCharactersCount,
        hydratedText,
      );
    else {
      chunks = [
        hydratedText.substr(0, maxCharactersCount),
        hydratedText.substr(maxCharactersCount, hydratedText.length),
      ];
    }

    chunks = chunks.filter((chunk) => chunk?.length > 0);
    if (chunks.length === 1)
      content = renderFullHTML();
    else {
      content = (
        <>
          {(
            html
              ? renderFullHTML(chunks[0])
              : chunks[0]
          )}

          {!toggled && (
            <span className='c-description-box__text'>...</span>
          )}

          {(toggled || renderHiddenChunk) && (
            <span
              className={c(
                'c-description-box__text',
                !toggled && 'is-hidden',
              )}
              {...(
                html
                  ? {
                    dangerouslySetInnerHTML: {
                      __html: chunks[1],
                    },
                    onClick: onClickHTML,
                  }
                  : {
                    children: chunks[1],
                  }
              )}
            />
          )}

          &nbsp;

          {(
            moreButtonRenderFn
              ? moreButtonRenderFn(
                {
                  expandTitle,
                  toggled,
                  setToggled,
                },
              )
              : (
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
              )
          )}
        </>
      );
    }
  } else {
    content = (
      html
        ? renderFullHTML()
        : hydratedText
    );
  }

  return (
    <DescriptionBox {...props}>
      {content}
      {children}
    </DescriptionBox>
  );
};

ExpandableDescriptionBox.displayName = 'ExpandableDescriptionBox';
