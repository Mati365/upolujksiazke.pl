import {Transform} from 'class-transformer';

export function TransformSeparatedArray(
  {
    integers = true,
  }: {
    integers?: boolean,
  } = {},
) {
  return Transform(({value}) => {
    const mapped = value?.split(',');
    if (integers)
      return mapped.map((n: any) => Number.parseInt(n, 10));

    return mapped;
  });
}
