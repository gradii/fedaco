export const _additionalProcessingGetter = (target, name, decorator) => {
  const descriptor = Object.getOwnPropertyDescriptor(target, name);
  const hasGetter = !!(descriptor && descriptor.get);
  const field = decorator.field || name;
  if (!hasGetter) {
    const propertyDescriptor = {
      enumerable: false,
      configurable: true,
      get: function() {
        return this.getAttribute(field);
      },
      set: function() {
        throw new Error('the relation field is readonly');
      }
    };
    Object.defineProperty(target, name, propertyDescriptor);
  }
};
export const _additionalProcessingGetterSetter = (target, name, decorator) => {
  const descriptor = Object.getOwnPropertyDescriptor(target, name);
  const hasGetter = !!(descriptor && descriptor.get);
  const hasSetter = !!(descriptor && descriptor.set);
  const field = decorator.field || name;
  if (!hasGetter || !hasSetter) {
    const propertyDescriptor = {
      enumerable: false,
      configurable: true
    };
    if (!hasGetter) {
      propertyDescriptor.get = function() {
        return this.getAttribute(field);
      };
    }
    if (!hasSetter) {
      propertyDescriptor.set = function(value) {
        this.setAttribute(field, value);
      };
    }
    Object.defineProperty(target, name, propertyDescriptor);
  }
};
