import {APIClientChild} from '@api/APIClient';
import type {ServerAPIClient} from './ServerAPIClient';

export abstract class ServerAPIClientChild extends APIClientChild<ServerAPIClient> {
  get services() {
    return this.api.services;
  }

  get jwt() {
    return this.api.services.decodedJWT;
  }
}
