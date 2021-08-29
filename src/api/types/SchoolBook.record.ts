import {BookSchoolLevel} from '@shared/enums/school';
import {APIRecord} from '../APIRecord';

export interface SchoolBookRecord extends APIRecord {
  classLevel: BookSchoolLevel;
  obligatory: boolean;
}
