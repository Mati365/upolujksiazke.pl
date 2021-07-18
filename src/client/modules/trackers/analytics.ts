/// <reference types="@types/gtag.js" />

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export function initGtag(key: string) {
  window.gtag ??= (...args: any[]) => {
    (window.dataLayer = window.dataLayer || []).push(...args);
  };

  gtag('js', new Date());
  gtag('config', key);
}
