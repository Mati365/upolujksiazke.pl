import {APIRepo} from '../APIRepo';
import {BookFullInfoRecord} from '../types/BookFullInfo.record';

export interface BooksRepo extends APIRepo<BookFullInfoRecord> {}
