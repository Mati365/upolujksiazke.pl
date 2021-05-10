export function isPromise<T = any>(obj: any): obj is Promise<T> {
  return !!obj && 'then' in obj;
}
