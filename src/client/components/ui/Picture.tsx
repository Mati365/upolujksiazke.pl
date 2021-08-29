import React, {ReactNode} from 'react';
import c from 'classnames';

type PictureProps = JSX.IntrinsicElements['picture'] & Pick<
JSX.IntrinsicElements['img'], 'alt' | 'src' | 'title' | 'loading'
> & {
  layer?: ReactNode,
};

export const Picture = (
  {
    children, src, alt,
    title, className, layer,
    loading = 'lazy',
    ...props
  }: PictureProps,
) => (
  <picture
    className={c(
      'c-picture',
      className,
    )}
    {...props}
  >
    {children}
    <img
      src={src}
      alt={alt}
      title={title || alt}
      loading={loading}
    />
    {layer}
  </picture>
);

Picture.displayName = 'Picture';
