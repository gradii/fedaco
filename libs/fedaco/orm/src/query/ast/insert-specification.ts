import { SqlNode } from '../sql-node';
import { SqlVisitor } from '../sql-visitor';
import { FromTable } from './from-table';
import { QuerySpecification } from './query-specification';
import { ValuesInsertSource } from './values-insert-source';


export class InsertSpecification extends SqlNode {
  constructor(
    public insertOption: string,
    public insertSource: ValuesInsertSource,
    public columns: SqlNode[],
    public target: QuerySpecification | FromTable
  ) {
    super();
  }

  accept(visitor: SqlVisitor) {
    return visitor.visitInsertSpecification(this);
  }
}