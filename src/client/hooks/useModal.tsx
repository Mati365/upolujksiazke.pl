import React, {ReactElement, ReactNode, useContext, useRef, useState} from 'react';
import * as R from 'ramda';

import {useSafeCallback} from './useSafeCallback';

type ModalShowConfig<Result = any, ShowProps = any> = {
  showProps?: ShowProps,
  onClose?(result?: Result): void,
  renderModalContent(
    attrs: {
      showProps: ShowProps,
      onClose(result?: Result): void,
    },
  ): ReactNode,
};

type ModalsContextData = {
  modals: Record<string, ModalShowConfig>,
  hideModal(uuid: string, result?: any): void,
  showModal(config: ModalShowConfig): {
    unmount: VoidFunction,
    uuid: string,
  },
};

const ModalsContext = React.createContext<ModalsContextData>(null);

type ModalsContextProviderProps = {
  children: ReactNode,
};

export const ModalsContextProvider = ({children}: ModalsContextProviderProps) => {
  const [modals, setModals] = useState<ModalsContextData['modals']>({});
  const counterRef = useRef<number>(0);

  const hideModal = (uuid: string, result?: any) => {
    const prevModal = modals[uuid];
    if (!prevModal)
      return;

    setModals(
      R.omit([uuid], modals),
    );

    if (prevModal.onClose)
      prevModal.onClose(result);
  };

  const showModal: ModalsContextData['showModal'] = (modal: ModalShowConfig) => {
    const uuid = `modal-${counterRef.current++}`;

    setModals(
      (prevModals) => ({
        ...prevModals,
        [uuid]: modal,
      }),
    );

    return {
      uuid,
      unmount: () => {
        hideModal(uuid);
      },
    };
  };

  return (
    <ModalsContext.Provider
      value={{
        modals,
        showModal,
        hideModal,
      }}
    >
      {children}
      {R.toPairs(modals).map(
        ([uuid, modalConfig]) => React.cloneElement(
          modalConfig.renderModalContent(
            {
              showProps: modalConfig.showProps,
              onClose: (result?: any) => hideModal(uuid, result),
            },
          ) as ReactElement,
          {
            key: uuid,
          },
        ),
      )}
    </ModalsContext.Provider>
  );
};

export function useModal<Result = any, ShowProps = any>(config: ModalShowConfig<Result, ShowProps>) {
  const modalsContext = useContext(ModalsContext);
  const modalsContextRef = useRef<typeof modalsContext>();

  const [uuid, setUUID] = useState<string>(null);
  const modalHandle = uuid ? modalsContext.modals[uuid] : null;

  modalsContextRef.current = modalsContext;

  const showModal = (showProps?: ShowProps) => new Promise<Result>((resolve) => {
    if (modalsContextRef.current.modals[uuid])
      return;

    const {uuid: newUUID} = modalsContextRef.current.showModal(
      {
        ...config,
        showProps,
        onClose(result?: Result) {
          setUUID(null);
          config.onClose?.(result); // eslint-disable-line no-unused-expressions
          resolve(result);
        },
      },
    );

    setUUID(newUUID);
  });

  const closeModal = useSafeCallback(() => {
    if (modalHandle && uuid)
      modalsContextRef.current.hideModal(uuid);
  });

  const toggleModal = useSafeCallback(() => {
    if (modalHandle)
      closeModal();
    else
      showModal();
  });

  return {
    toggled: !!modalHandle,
    show: showModal,
    close: closeModal,
    toggle: toggleModal,
  };
}
