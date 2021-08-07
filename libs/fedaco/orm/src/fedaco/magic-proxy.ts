import { makeDecorator } from '@gradii/annotation';

function magicMethods (clazz) {
  // A toggle switch for the __isset method
  // Needed to control "prop in instance" inside of getters
  let issetEnabled = true

  const classHandler = Object.create(null)

  // Trap for class instantiation
  classHandler.construct = (target, args) => {
    // Wrapped class instance
    const instance = new clazz(...args)

    // Instance traps
    const instanceHandler = Object.create(null)

    // __get() (__call included)
    // Catches "instance.property"
    const get = Object.getOwnPropertyDescriptor(clazz.prototype, '__get')
    if (get) {
      instanceHandler.get = (target, name) => {
        // We need to turn off the __isset() trap for the moment to establish compatibility with PHP behaviour
        // PHP's __get() method doesn't care about its own __isset() method, so neither should we
        issetEnabled = false
        const exists = name in target
        issetEnabled = true

        if (exists) {
          return target[name]
        } else {
          return get.value.call(target, name)
        }
      }
    }

    // __set()
    // Catches "instance.property = ..."
    const set = Object.getOwnPropertyDescriptor(clazz.prototype, '__set')
    if (set) {
      instanceHandler.set = (target, name, value) => {
        if (name in target) {
          target[name] = value
        } else {
          return target.__set.call(target, name, value)
        }
      }
    }

    // __isset()
    // Catches "'property' in instance"
    const isset = Object.getOwnPropertyDescriptor(clazz.prototype, '__isset')
    if (isset) {
      instanceHandler.has = (target, name) => {
        if (!issetEnabled) return name in target

        return isset.value.call(target, name)
      }
    }

    // __unset()
    // Catches "delete instance.property"
    const unset = Object.getOwnPropertyDescriptor(clazz.prototype, '__unset')
    if (unset) {
      instanceHandler.deleteProperty = (target, name) => {
        return unset.value.call(target, name)
      }
    }

    return new Proxy(instance, instanceHandler)
  }

  // __getStatic()
  // Catches "class.property"
  if (Object.getOwnPropertyDescriptor(clazz, '__getStatic')) {
    classHandler.get = (target, name, receiver) => {
      if (name in target) {
        return target[name]
      } else {
        return target.__getStatic.call(receiver, name)
      }
    }
  }

  // __setStatic()
  // Catches "class.property = ..."
  if (Object.getOwnPropertyDescriptor(clazz, '__setStatic')) {
    classHandler.set = (target, name, value, receiver) => {
      if (name in target) {
        return target[name]
      } else {
        return target.__setStatic.call(receiver, name, value)
      }
    }
  }

  return new Proxy(clazz, classHandler)
}

/**
 * @deprecated use NoSuchMethodProxy instead
 */
export const MagicProxy = makeDecorator('magic proxy',
  (clz) => clz, undefined, undefined,
  (type, meta) => {
    return magicMethods(type);
  }
);
