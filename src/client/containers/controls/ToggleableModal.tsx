import React, {ReactNode} from 'react';
import c from 'classnames';

import {stopPropagation} from '@client/helpers/html/suppressEvent';

import {Size} from '@shared/types';
import {TimesIcon} from '@client/components/svg';

type ModalType = 'wide' | 'default';

export type ToggleableModalProps = {
  showCloseButton?: boolean,
  toggled?: boolean,
  fixed?: boolean,
  spaced?: boolean,
  header?: ReactNode,
  type?: ModalType,
  rounded?: boolean,
  className?: string,
  size?: Size,
  children?(): ReactNode,
  onRequestClose?(): void,
};

export const ToggleableModal = (
  {
    size,
    children,
    header,
    type = 'default',
    showCloseButton = true,
    fixed = true,
    toggled = true,
    className,
    spaced, rounded, onRequestClose,
  }: ToggleableModalProps,
) => {
  if (!toggled)
    return null;

  return (
    <div
      className={c(
        'c-modal',
        type && `is-${type}`,
        `is-${fixed ? 'fixed' : 'absolute'}`,
        className,
      )}
      onMouseDown={stopPropagation}
      onClick={
        (e) => {
          onRequestClose();
          stopPropagation(e);
        }
      }
    >
      <div className='c-modal__backdrop' />
      <div
        className={c(
          'c-modal__content',
          spaced && 'is-spaced',
          rounded && 'is-rounded',
        )}
        style={
          type === 'default' && size
            ? {
              width: size.w,
              height: size.h,
            }
            : null
        }
        onMouseDown={stopPropagation}
        onClick={stopPropagation}
      >
        {showCloseButton && (
          <button
            type='button'
            className='c-modal__close'
            onClick={onRequestClose}
          >
            <TimesIcon />
          </button>
        )}

        {header && (
          <div className='c-modal__header'>
            {header}
          </div>
        )}

        <div className='c-modal__inner'>
          {children()}
        </div>
      </div>
    </div>
  );
};
