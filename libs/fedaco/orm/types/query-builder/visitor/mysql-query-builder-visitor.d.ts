/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { DeleteSpecification } from '../../query/ast/delete-specification';
import { UpdateSpecification } from '../../query/ast/update-specification';
import { GrammarInterface } from '../grammar.interface';
import { QueryBuilder } from '../query-builder';
import { QueryBuilderVisitor } from './query-builder-visitor';
export declare class MysqlQueryBuilderVisitor extends QueryBuilderVisitor {
    constructor(_grammar: GrammarInterface, 
    /**
     * @deprecated
     * todo remove queryBuilder. should use binding only
     */
    _queryBuilder: QueryBuilder);
    visitDeleteSpecification(node: DeleteSpecification): string;
    visitUpdateSpecification(node: UpdateSpecification): string;
}
