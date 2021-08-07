export interface ProcessorInterface {
  processSelect(queryBuilder, results)

  processInsertGetId(sql, bindings: any[],sequence?)
}
