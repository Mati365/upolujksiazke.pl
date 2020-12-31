import {shallowMemoizeOneCall} from '../memoizeOne';
import {WrapMethod} from './WrapMethod';

export const MemoizeMethod = WrapMethod(shallowMemoizeOneCall);
