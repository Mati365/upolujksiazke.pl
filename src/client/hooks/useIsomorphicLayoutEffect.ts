import {useEffect, useLayoutEffect} from 'react';
import {isSSR} from '@shared/helpers/isSSR';

export const useIsomorphicLayoutEffect = isSSR() ? useEffect : useLayoutEffect;
