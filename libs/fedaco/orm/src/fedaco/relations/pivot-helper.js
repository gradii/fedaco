import { resolveForwardRef } from '../../query-builder/forward-ref'
export function fromAttributes(
  clazz,
  parent,
  attributes,
  table,
  exists = false
) {
  clazz = resolveForwardRef(clazz)

  const instance = new clazz()
  instance._timestamps = instance.hasTimestampAttributes(attributes)
  instance
    .setConnection(parent.getConnectionName())
    .setTable(table)
    .forceFill(attributes)
    .syncOriginal()
  instance.pivotParent = parent
  instance._exists = exists
  return instance
}
export function fromRawAttributes(
  clazz,
  parent,
  attributes,
  table,
  exists = false
) {
  const instance = fromAttributes(clazz, parent, [], table, exists)
  instance._timestamps = instance.hasTimestampAttributes(attributes)
  instance.setRawAttributes(attributes, exists)
  return instance
}
