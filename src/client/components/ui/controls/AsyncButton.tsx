import React from 'react';

import {Spinner} from '@client/components/ui';

import {Button, ButtonProps} from './Button';
import {
  AsyncSpinnerControl,
  AsyncSpinnerControlCustomizeProps,
} from './AsyncSpinnerControl';

export type AsyncButtonProps = ButtonProps & AsyncSpinnerControlCustomizeProps;

export const AsyncButton = ({children, ...props}: AsyncButtonProps) => (
  <AsyncSpinnerControl
    controlComponent={Button}
    asyncHandlers={['onClick']}
    loadingStateProps={
      (loading) => loading && ({
        disabled: true,
      })
    }
    {...props}
  >
    {(loading) => (
      <>
        {children}
        {loading && (
          <Spinner
            className='ml-2'
            size='small'
          />
        )}
      </>
    )}
  </AsyncSpinnerControl>
);

AsyncButton.displayName = 'AsyncButton';
