import {Expose, Type} from 'class-transformer';
import {APICountedRecord} from '@api/APIRecord';

export function createCountedRecordSerializer<T>(innerType: any) {
  class NestedSerializer implements APICountedRecord<T> {
    @Expose()
    count: number;

    @Expose()
    @Type(() => innerType)
    record: T;
  }

  return NestedSerializer;
}

export function CountedRecordType(innerType: () => any) {
  const serializer = createCountedRecordSerializer(innerType());

  return Type(() => serializer);
}
