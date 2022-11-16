import { head } from 'ramda';
import { tap } from 'rxjs/operators';
import { Column } from '../../src/annotation/column/column';
import { PrimaryColumn } from '../../src/annotation/column/primary.column';
import {
  BelongsToManyColumn
} from '../../src/annotation/relation-column/belongs-to-many.relation-column';
import { Table } from '../../src/annotation/table/table';
import { DatabaseConfig } from '../../src/database-config';
import { FedacoRelationListType } from '../../src/fedaco/fedaco-types';
import { Model } from '../../src/fedaco/model';
import { forwardRef } from '../../src/query-builder/forward-ref';
import { SchemaBuilder } from '../../src/schema/schema-builder';

function connection(connectionName = 'default') {
  return Model.getConnectionResolver().connection(connectionName);
}

function schema(connectionName = 'default'): SchemaBuilder {
  return connection(connectionName).getSchemaBuilder();
}

jest.setTimeout(100000);

async function createSchema() {
  await schema().create('users', table => {
    table.increments('id');
    table.string('email').withUnique();
  });
  await schema().create('articles', table => {
    table.increments('aid');
    table.string('title');
  });
  await schema().create('article_user', table => {
    table.integer('article_id').withUnsigned();
    table.foreign('article_id').withReferences('aid').withOn('articles');
    table.integer('user_id').withUnsigned();
    table.foreign('user_id').withReferences('id').withOn('users');
  });
}

async function seedData() {
  const user = await BelongsToManyChunkByIdTestTestUser.createQuery().create({
    'id'   : 1,
    'email': 'linbolen@gradii.com'
  });
  await BelongsToManyChunkByIdTestTestArticle.createQuery().insert([
    {
      'aid'  : 1,
      'title': 'Another title'
    }, {
      'aid'  : 2,
      'title': 'Another title'
    }, {
      'aid'  : 3,
      'title': 'Another title'
    }
  ]);
  await user.$newRelation('articles').sync([3, 1, 2]);
}

describe('test database fedaco belongs to many chunk by id', () => {
  beforeAll(async () => {
    const db = new DatabaseConfig();
    db.addConnection({
      'driver'  : 'sqlite',
      'database': ':memory:'
    });
    db.bootFedaco();
    db.setAsGlobal();
    await createSchema();
  });

  afterAll(async () => {
    await schema().drop('users');
    await schema().drop('articles');
    await schema().drop('article_user');
  });

  it('belongs to chunk by id', async () => {
    await seedData();
    const user: BelongsToManyChunkByIdTestTestUser = await BelongsToManyChunkByIdTestTestUser.createQuery().first();

    let i = 0;

    await user.$newRelation('articles').chunkById(1).pipe(
      tap(({results: collection}: { results: any[] }) => {
        i++;
        //must be string!
        expect(head(collection).aid).toBe(`${i}`);
      })
    ).toPromise();
    expect(i).toEqual(3);
  });
});

@Table({
  tableName: 'users'
})
export class BelongsToManyChunkByIdTestTestUser extends Model {
  // _table: any            = 'users';
  _fillable: any         = ['id', 'email'];
  public timestamps: any = false;

  @PrimaryColumn()
  id: string | number;

  @BelongsToManyColumn({
    related        : forwardRef(() => BelongsToManyChunkByIdTestTestArticle),
    table          : 'article_user',
    foreignPivotKey: 'user_id',
    relatedPivotKey: 'article_id'
  })
  public articles: FedacoRelationListType<BelongsToManyChunkByIdTestTestArticle>;
}

@Table({
  tableName: 'articles'
})
export class BelongsToManyChunkByIdTestTestArticle extends Model {
  // _primaryKey: any         = 'aid';
  // _table: any              = 'articles';
  // _keyType: any            = 'string';
  public incrementing: any = false;
  public timestamps: any   = false;
  protected fillable: any  = ['aid', 'title'];

  @PrimaryColumn({
    keyType: 'string'
  })
  aid: string | number;

  @Column()
  title: string;
}
