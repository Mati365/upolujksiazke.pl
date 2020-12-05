export function clearAndAssignObject<R extends object = any>(target: R, source: R): R {
  if (!target || !source)
    return target;

  for (const member in target)
    delete target[member];

  Object.assign(target, source);
  return source;
}
