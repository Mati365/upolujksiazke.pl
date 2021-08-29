import {REQUEST} from '@nestjs/core';
import {Inject, Scope} from '@nestjs/common';

import {isCmdAppInstance} from '@server/common/helpers';
import {NOP_SERVICE} from '../Nop.service';

export function SafeInjectRequest() {
  return Inject(isCmdAppInstance() ? NOP_SERVICE : REQUEST);
}

export function safeRequestScope() {
  return (
    isCmdAppInstance()
      ? Scope.DEFAULT
      : Scope.REQUEST
  );
}
