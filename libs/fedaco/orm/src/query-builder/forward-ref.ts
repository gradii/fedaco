export type ForwardRefFn<T = any> = () => T;

export function forwardRef(forwardRefFn: ForwardRefFn): ForwardRefFn<any> {
  (<any>forwardRefFn).__forward_ref__ = forwardRef;
  return (<any>forwardRefFn);
}


export function resolveForwardRef<T>(type: ForwardRefFn<T> | T | undefined): T {
  return isForwardRef(type) ? type() : type;
}

export function isForwardRef(fn: any): fn is() => any {
  return typeof fn === 'function' && fn.hasOwnProperty('__forward_ref__') &&
    fn.__forward_ref__ === forwardRef;
}
