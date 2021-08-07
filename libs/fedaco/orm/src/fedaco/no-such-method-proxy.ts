import { makeDecorator } from '@gradii/annotation';

function magicMethods(clazz) {
  const classHandler = Object.create(null);

  // Trap for class instantiation
  classHandler.construct = (target, args) => {
    // Wrapped class instance
    const instance = new clazz(...args);

    // Instance traps
    const instanceHandler = Object.create(null);

    const noSuchMethod = Object.getOwnPropertyDescriptor(clazz.prototype, '__noSuchMethod__');
    const bindingMap   = {};
    if (noSuchMethod) {
      // tslint:disable-next-line:no-shadowed-variable
      instanceHandler.get = (target, name) => {
        const exists = name in target

        if (exists) {
          return target[name];
        } else {
          if (!bindingMap[name]) {
            bindingMap[name] = (..._args) => noSuchMethod.value.call(target, name, _args);
          }
          return bindingMap[name];
        }
      };
    }

    return new Proxy(instance, instanceHandler);
  };

  // // __getStatic()
  // // Catches "class.property"
  // if (Object.getOwnPropertyDescriptor(clazz, '__noSuchStaticMethod__')) {
  //   classHandler.get = (target, name, receiver) => {
  //     if (name in target) {
  //       return target[name]
  //     } else {
  //       return target.__noSuchStaticMethod__.call(receiver, name)
  //     }
  //   }
  // }
  //
  return new Proxy(clazz, classHandler);
}

export const NoSuchMethodProxy = makeDecorator('no such method proxy',
  (clz) => clz, undefined, undefined,
  (type, meta) => {
    return magicMethods(type);
  }
);
