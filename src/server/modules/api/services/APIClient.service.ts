import {Injectable} from '@nestjs/common';
import {BookGroupsService} from '@server/modules/book/services';
import {ServerAPIClient} from '../client/ServerAPIClient';

@Injectable()
export class APIClientService {
  public readonly client = new ServerAPIClient(this);

  constructor(
    public readonly bookGroupsService: BookGroupsService,
  ) {}
}
