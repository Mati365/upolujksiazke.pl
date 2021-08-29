import {Transform} from 'class-transformer';

export function TransformSeparatedArray(
  {
    integers = true,
  }: {
    integers?: boolean,
  } = {},
) {
  return Transform(({value}) => {
    const mapped = (
      Array.isArray(value)
        ? value
        : value?.split(',')
    );

    if (integers)
      return mapped.map((n: any) => Number.parseInt(n, 10));

    return mapped;
  });
}
