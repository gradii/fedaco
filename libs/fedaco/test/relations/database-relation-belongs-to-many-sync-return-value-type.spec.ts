import { PrimaryColumn } from '../../src/annotation/column/primary.column';
import { BelongsToManyColumn } from '../../src/annotation/relation-column/belongs-to-many.relation-column';
import { DatabaseConfig } from '../../src/database-config';
import { Model } from '../../src/fedaco/model';
import { forwardRef } from '../../src/query-builder/forward-ref';
import type { SchemaBuilder } from '../../src/schema/schema-builder';
import { Table } from './../../src/annotation/table/table';
import type { FedacoRelationListType } from './../../src/fedaco/fedaco-types';


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
    table.string('id');
    table.string('title');
    table.primary('id');
  });
  await schema().create('article_user', table => {
    table.string('article_id');
    table.foreign('article_id').withReferences('id').withOn('articles');
    table.integer('user_id').withUnsigned();
    table.foreign('user_id').withReferences('id').withOn('users');
  });
}

async function seedData() {
  await BelongsToManySyncTestTestUser.createQuery().create({
    'id'   : 1,
    'email': 'linbolen@gradii.com'
  });
  await BelongsToManySyncTestTestArticle.createQuery().insert([
    {
      'id'   : '7b7306ae-5a02-46fa-a84c-9538f45c7dd4',
      'title': 'uuid title'
    }, {
      'id'   : /* cast type string */ 10000000 + 1,
      'title': 'Another title'
    }, {
      'id'   : '1',
      'title': 'Another title'
    }
  ]);
}

describe('test database fedaco belongs to many sync return value type', () => {
  beforeAll(async () => {
    const db = new DatabaseConfig();
    db.addConnection({
      'driver'                 : 'sqlite',
      'database'               : ':memory:',
      'foreign_key_constraints': false
    });
    db.bootFedaco();
    db.setAsGlobal();
    await createSchema();
  });

  afterAll(async () => {
    await schema().disableForeignKeyConstraints();
    await schema().drop('users');
    await schema().drop('articles');
    await schema().drop('article_user');
  });

  it('sync return value type', async () => {
    await seedData();
    const user       = await BelongsToManySyncTestTestUser.createQuery().first();
    const articleIDs = await BelongsToManySyncTestTestArticle.createQuery().pluck('id') as any[];
    const changes    = await user.NewRelation('articles').sync(articleIDs);
    changes['attached'].map(id => {
      expect(new BelongsToManySyncTestTestArticle().GetKeyType()).toBe(typeof id);
    });
  });
});

@Table({
  tableName: 'users'
})
export class BelongsToManySyncTestTestUser extends Model {
  // _table: any            = 'users';
  _fillable: any         = ['id', 'email'];
  public timestamps: any = false;

  @BelongsToManyColumn({
    related        : forwardRef(() => BelongsToManySyncTestTestArticle),
    table          : 'article_user',
    foreignPivotKey: 'user_id',
    relatedPivotKey: 'article_id'
  })
  public articles: FedacoRelationListType<BelongsToManySyncTestTestArticle>;
}

@Table({
  tableName: 'articles'
})
export class BelongsToManySyncTestTestArticle extends Model {
  // _table: any              = 'articles';
  // _keyType: any            = 'string';

  @PrimaryColumn({
    keyType: 'string'
  })
  id: string;

  public incrementing: any = false;
  public timestamps: any   = false;
  _fillable: any           = ['id', 'title'];
}
