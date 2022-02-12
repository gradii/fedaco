export function forwardRef(forwardRefFn) {
  forwardRefFn.__forward_ref__ = forwardRef
  return forwardRefFn
}
export function resolveForwardRef(type) {
  return isForwardRef(type) ? type() : type
}
export function isForwardRef(fn) {
  return (
    typeof fn === 'function' &&
    fn.hasOwnProperty('__forward_ref__') &&
    fn.__forward_ref__ === forwardRef
  )
}
