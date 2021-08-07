import { Constructor } from '../helper/constructor';

function throwBadMethodCallException(method: string) {
  throw new Error(`Call to undefined method ForwardsCalls::${method}()`);
}

/** @docs-private */
export interface ForwardsCalls {
  forwardCallTo(object: any, method: string, parameters: any[])
}

/** @docs-private */
export type ForwardsCallsCtor = Constructor<ForwardsCalls>;

/** Mixin to augment a directive with a `disableRipple` property. */
export function mixinForwardsCalls<T extends Constructor<{}>>(base: T): ForwardsCallsCtor & T {
  //@ts-ignore
  return class _Self extends base {
    /*Throw a bad method call exception for the given method.*/

    /*Forward a method call to the given object.*/
    protected forwardCallTo(object: any, method: string, parameters: any[]) {
      try {
        return object[method].apply(object, parameters);
      } catch (e) {
        throwBadMethodCallException(method);
      }
    }
  };



}
