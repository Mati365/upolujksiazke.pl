import {useEffect} from 'react';

function fullscreenLockHandler() {
  const {style, classList} = document.body;
  const htmlRootElement = document.body;

  classList.add('has-scroll-lock');
  Object.assign(
    style,
    {
      position: 'fixed',
      width: '100vw',
      left: 0,
      top: `-${window.scrollY}px`,
    },
  );

  htmlRootElement.style.overflow = 'hidden';

  return () => {
    const scrollY = document.body.style.top;

    htmlRootElement.style.overflow = '';
    Object.assign(
      style,
      {
        position: '',
        top: '',
      },
    );

    window.scrollTo(0, Number.parseInt(scrollY || '0', 10) * -1);

    setTimeout(
      () => {
        classList.remove('has-scroll-lock');
      },
      250,
    );
  };
}

export function useLockWebsiteScroll(lock: boolean) {
  useEffect(
    () => {
      if (!lock)
        return null;

      return fullscreenLockHandler();
    },
    [lock],
  );
}
