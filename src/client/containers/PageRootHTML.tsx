import React from 'react';

import {JSONGlobalVariable} from '@client/components';
import {
  PageRoot,
  PageRootProps,
} from './PageRoot';

type PageRootHTMLProps = {
  lang?: string,
  manifest: object,
  provideRootProps: PageRootProps
  provideAsGlobals?: object,
};

export const SSR_HEAD_TAGS_MAGIC = 'SSR_HEAD_TAGS_MAGIC';

export const PageRootHTML = (
  {
    lang = 'en',
    manifest,
    provideAsGlobals,
    provideRootProps,
  }: PageRootHTMLProps,
) => (
  <html lang={lang}>
    <head>
      <meta charSet='utf-8' />
      {SSR_HEAD_TAGS_MAGIC}

      {/* favicons */}
      <link rel='shortcut icon' href='/favicon.ico' type='image/x-icon' />
      <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
      <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
      <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
      <link rel='manifest' href='/site.webmanifest' />

      {/* css */}
      <link rel='stylesheet' type='text/css' href={manifest['client.css']} />

      {/* preload */}
      <link rel='preload' as='script' href={manifest['client.js']} />
    </head>

    <body>
      <div id='app-hydrate-root'>
        <PageRoot {...provideRootProps} />
      </div>

      <JSONGlobalVariable data={provideAsGlobals} />
      <script src={manifest['client.js']} />
    </body>
  </html>
);

PageRootHTML.displayName = 'PageRootHTML';
