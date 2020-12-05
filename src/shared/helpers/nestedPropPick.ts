import * as R from 'ramda';

type NestedPickOptConfig = {
  whitelistKeys?: string[],
};

/**
 * Picks e.g. id from all objects in
 * object, it saves object structure.
 * Do not picks id directly from parent
 *
 * @param {String}  prop        Property to pick
 * @param {Object}  obj         Picked obj
 * @param {NestedPickOptConfig} optConfig Additional config
 * @param {Boolean} omitParent  First parent might contain id and other keys will be omitted
 */
export function nestedPropPick<T>(
  prop: string,
  obj: T,
  optConfig: NestedPickOptConfig = {},
  omitParent: boolean = true,
): any {
  if (R.is(File, obj))
    return obj;

  const mapObj = R.cond(
    [
      [R.is(String), R.identity],
      [
        R.either(
          R.is(File),
          R.isNil,
        ),
        R.identity,
      ],
      [
        R.both(
          R.complement(R.equals as any)(obj) as any,
          R.has(prop),
        ),
        R.prop(prop),
      ],
      [R.is(Array), R.map(
        (val) => nestedPropPick(prop, val, optConfig, false),
      )],
      [R.is(Object), R.mapObjIndexed(
        (val, key) => {
          if (optConfig.whitelistKeys && R.includes(key, optConfig.whitelistKeys))
            return val;

          return nestedPropPick(prop, val, optConfig, false);
        },
      )],
      [R.T, R.identity],
    ],
  );

  return R.when(
    R.is(Object),
    omitParent
      ? mapObj
      : R.ifElse(R.has(prop), R.prop(prop), mapObj),
  )(obj);
}
