import {Expose, Type} from 'class-transformer';
import {
  APIBucketTotalStats,
  APICountedBucket,
  APICountedRecord,
} from '@api/APIRecord';

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

export function BucketType(innerType: () => any) {
  const itemSeralizer = createCountedRecordSerializer(innerType());

  class BucketSerializer implements APICountedBucket<any> {
    @Expose()
    total: APIBucketTotalStats;

    @Expose()
    @Type(() => itemSeralizer)
    items: any[];
  }

  return Type(() => BucketSerializer);
}
