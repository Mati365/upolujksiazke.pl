import React from 'react';
import c from 'classnames';

type PictureProps = JSX.IntrinsicElements['picture'];

export const Picture = ({children, className}: PictureProps) => (
  <picture className={c('c-picture', className)}>
    {children}
  </picture>
);

Picture.displayName = 'Picture';
