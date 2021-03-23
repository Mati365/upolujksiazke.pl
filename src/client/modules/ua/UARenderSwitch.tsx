import {ReactNode} from 'react';
import {UA, useUA} from './useUA';

type UARenderSwitchProps = {
  render: Record<keyof UA, (ua: UA) => ReactNode>,
};

export const UARenderSwitch = ({render}: UARenderSwitchProps) => {
  const ua = useUA();

  for (const key in ua) {
    if (ua[key] && render[key])
      return render[key](ua);
  }

  return null;
};

UARenderSwitch.displayName = 'UARenderSwitch';
