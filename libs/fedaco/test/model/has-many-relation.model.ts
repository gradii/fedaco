/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Column } from '../../src/annotation/column/column';
import { HasManyColumn } from '../../src/annotation/relation-column/has-many.relation-column';
import { Table } from '../../src/annotation/table/table';
import { Model } from '../../src/fedaco/model';

@Table({
  tableName: 'article_model'
})
export class ArticleModel extends Model {

}


@Table({
  tableName: 'member_model',
})
export class MemberModel extends Model {

  @Column()
  id: number;

  @HasManyColumn({
    related: ArticleModel
  })
  articles: Promise<any>;
}

@Table({
  tableName: 'has_many_relation_model',
})
export class HasManyRelationModel extends Model {

  @HasManyColumn({
    related: ArticleModel
  })
  columnFoo: any;
}

