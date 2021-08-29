import React, {ComponentType, CSSProperties} from 'react';
import c from 'classnames';

export type IconProps = Pick<JSX.IntrinsicElements['i'], 'onClick' | 'onMouseOver'> & {
  style?: CSSProperties,
  className?: string,
  size?: string,
  color?: string,
  viewBox?: string,
  title?: string,
  svgComponent: ComponentType<any>,
};

export const Icon = (
  {
    svgComponent: SvgComponent,
    size = 'normal',
    color,
    title,
    viewBox,
    className,
    style,
    onClick,
    onMouseOver,
  }: IconProps,
) => (
  <i
    title={title}
    style={style}
    className={c(
      'c-icon',
      `is-text-${size}`,
      color && `is-text-${color}`,
      className,
    )}
    onClick={onClick}
    onMouseOver={onMouseOver}
  >
    <SvgComponent viewBox={viewBox} />
  </i>
);

Icon.displayName = 'Icon';

Icon.createFromSVG = (
  svgComponent: ComponentType,
  viewBox: string = '0 0 24 24',
) => (props: Omit<IconProps, 'svgComponent'>) => (
  <Icon
    {...props}
    viewBox={viewBox}
    svgComponent={svgComponent}
  />
);
