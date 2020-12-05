import {shallowMemoizeOneCall} from '../memoizeOne';
import {wrapMethod} from './wrapMethod';

export const memoizeMethod = wrapMethod(shallowMemoizeOneCall);
