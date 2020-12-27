import {FindManyOptions, FindOneOptions} from 'typeorm';

export function declareScope<T>(
  proto: new(...args: any[]) => T,
  obj: ThisType<T>,
  scope: FindOneOptions<T>,
): any {
  const NewProto = class extends (obj as any) {};
  const existed = (obj as any).scopes || [];
  const scopes = (NewProto.scopes = existed.concat(scope)); // eslint-disable-line no-multi-assign

  const scopesFindOptions = scopes.reduce((r, c) => Object.assign(r, c), {});

  const resolveFindParams = (options: any): any => {
    let findOptions: any;
    if (!options) {
      findOptions = scopesFindOptions;
    }

    if (options && !options.where) {
      findOptions = {
        ...options,
        ...scopesFindOptions,
      };
    }

    if (options && options.where) {
      findOptions = options;
      findOptions.where = {
        ...options.where,
        ...scopesFindOptions,
      };
    }

    return findOptions;
  };

  NewProto.find = async (options?: FindManyOptions<T>): Promise<any[]> => {
    const findOptions = resolveFindParams(options);
    return (proto as any).find(findOptions);
  };

  NewProto.findOne = async (options: FindOneOptions<T>): Promise<any[]> => {
    if (typeof options !== 'object') {
      return (proto as any).findOne(options, scopesFindOptions);
    }

    const findOptions = resolveFindParams(options);
    return (proto as any).findOne(findOptions);
  };

  NewProto.findOneOrFail = async (options: FindOneOptions<T>): Promise<any[]> => {
    if (typeof options !== 'object')
      return (proto as any).findOne(options);

    const findOptions = resolveFindParams(options);
    return (proto as any).findOneOrFail(findOptions);
  };

  NewProto.count = async (options: FindManyOptions<T>): Promise<any[]> => {
    const findOptions = resolveFindParams(options);
    return (proto as any).count(findOptions);
  };

  return NewProto;
}
