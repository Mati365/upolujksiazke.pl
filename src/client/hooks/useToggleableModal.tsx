import React, {ReactNode} from 'react';
import {
  ToggleableModal,
  ToggleableModalProps,
} from '@client/containers/controls/ToggleableModal';

import {useUA} from '@client/modules/ua';
import {useModal} from './useModal';

export function useToggleableModal(
  {
    renderFn,
    ...props
  }: ToggleableModalProps & {
    renderFn(collapse: VoidFunction): ReactNode,
  },
) {
  const ua = useUA();

  return useModal(
    {
      renderModalContent: ({onClose}) => (
        <ToggleableModal
          onRequestClose={onClose}
          {...props}
          type={
            props.type ?? (
              ua.mobile
                ? 'wide'
                : 'default'
            )
          }
        >
          {() => renderFn(onClose)}
        </ToggleableModal>
      ),
    },
  );
}
