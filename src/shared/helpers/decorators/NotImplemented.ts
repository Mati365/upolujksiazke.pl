export function NotImplemented(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  descriptor.value = () => {
    throw new Error('Called not implemented method!');
  };
}
