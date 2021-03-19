import React, {ReactNode, useEffect, useRef, useState} from 'react';
import {isSSR} from '@shared/helpers/isSSR';

type LazyHydrateProps = {
  children: ReactNode,
  onEvent?: string,
};

export const LazyHydrate = ({children, onEvent}: LazyHydrateProps) => {
  const ref = useRef<HTMLDivElement>();
  const [hydrated, setHydrated] = useState(false);

  useEffect(
    () => {
      const {current: node} = ref;
      const unmounters: VoidFunction[] = [];

      const cleanup = () => {
        while (unmounters.length)
          unmounters.pop()();
      };

      const hydrate = () => {
        cleanup();
        setHydrated(true);
      };

      if (onEvent) {
        node.addEventListener(onEvent, hydrate, {
          once: true,
          capture: true,
          passive: true,
        });

        unmounters.push(
          () => {
            node.removeEventListener(onEvent, hydrate, {capture: true});
          },
        );
      }

      return cleanup;
    },
    [hydrated, onEvent],
  );

  if (hydrated || isSSR()) {
    return (
      <div
        ref={ref}
        style={{
          display: 'contents',
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      style={{
        display: 'contents',
      }}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: '',
      }}
    />
  );
};

LazyHydrate.displayName = 'LazyHydrate';
