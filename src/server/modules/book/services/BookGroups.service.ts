import {Injectable} from '@nestjs/common';

@Injectable()
export class BookGroupsService {
  findCategoriesRecentBooks() {
    console.info('call');
  }
}
