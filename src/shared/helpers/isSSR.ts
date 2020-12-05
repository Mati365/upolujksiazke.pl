const SSR = typeof document === 'undefined';

export const isSSR = (): boolean => SSR;
