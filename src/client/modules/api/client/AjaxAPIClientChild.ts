import {APIClientChild} from '@api/APIClient';
import type {AjaxAPIClient} from './AjaxAPIClient';

export abstract class AjaxAPIClientChild extends APIClientChild<AjaxAPIClient> {
  get ajax() {
    return this.api.asyncCaller;
  }
}
