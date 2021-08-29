import {APICountedRecord} from '@api/APIRecord';

export function countedRecordToCountedListItem<T>({count, record}: APICountedRecord<T>) {
  return {
    count,
    ...record,
  };
}

export function mapCountedRecordsToCountedListItems<T>(items: APICountedRecord<T>[]) {
  return (items || []).map(countedRecordToCountedListItem);
}
