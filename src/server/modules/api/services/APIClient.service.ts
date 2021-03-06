import {Injectable} from '@nestjs/common';
import {ServerAPIClient} from '../client/ServerAPIClient';

@Injectable()
export class APIClientService {
  public readonly client = new ServerAPIClient;
}
