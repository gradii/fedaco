import { formatISO } from 'date-fns';
import { Column } from '../../src/annotation/column/column';
import { CreatedAtColumn } from '../../src/annotation/column/created-at.column';
import { PrimaryColumn } from '../../src/annotation/column/primary.column';
import { UpdatedAtColumn } from '../../src/annotation/column/updated-at.column';
import {
  BelongsToManyColumn
} from '../../src/annotation/relation-column/belongs-to-many.relation-column';
import {
  MorphToManyColumn
} from '../../src/annotation/relation-column/morph-to-many.relation-column';
import {
  MorphedByManyColumn
} from '../../src/annotation/relation-column/morphed-by-many.relation-column';
import { Table } from '../../src/annotation/table/table';
import { DatabaseConfig } from '../../src/database-config';
import { Model } from '../../src/fedaco/model';
import { forwardRef } from '../../src/query-builder/forward-ref';
import { SchemaBuilder } from '../../src/schema/schema-builder';
import { FedacoRelationListType, FedacoRelationType } from './../../src/fedaco/fedaco-types';

function connection(connectionName = 'default') {
  return Model.getConnectionResolver().connection(connectionName);
}

function schema(connectionName = 'default'): SchemaBuilder {
  return connection(connectionName).getSchemaBuilder();
}

jest.setTimeout(100000);

async function createSchema() {
  await schema().create('irregular_plural_humans', table => {
    table.increments('id');
    table.string('email').withUnique();
    table.timestamps();
  });
  await schema().create('irregular_plural_tokens', table => {
    table.increments('id');
    table.string('title');
  });
  await schema().create('irregular_plural_human_irregular_plural_token', table => {
    table.integer('irregular_plural_human_id').withUnsigned();
    table.integer('irregular_plural_token_id').withUnsigned();
  });
  await schema().create('irregular_plural_mottos', table => {
    table.increments('id');
    table.string('name');
  });
  await schema().create('cool_mottos', table => {
    table.integer('irregular_plural_mottos_id');
    table.integer('cool_motto_id');
    table.string('cool_motto_type');
  });
}

describe('test database fedaco irregular plural', () => {
  beforeEach(async () => {
    const db = new DatabaseConfig();
    db.addConnection({
      'driver'  : 'sqlite',
      'database': ':memory:'
    });
    db.bootFedaco();
    db.setAsGlobal();
    await createSchema();
  });

  afterEach(async () => {
    await schema().drop('irregular_plural_tokens');
    await schema().drop('irregular_plural_humans');
    await schema().drop('irregular_plural_human_irregular_plural_token');
  });

  it('it pluralizes the table name', async () => {
    const model = new IrregularPluralHuman();
    expect(model.GetTable()).toBe('irregular_plural_humans');
  });

  it('it touches the parent with an irregular plural', async () => {
    // Carbon.setTestNow('2018-05-01 12:13:14');

    await IrregularPluralHuman.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
    await IrregularPluralToken.createQuery().insert([
      {
        'title': 'The title'
      }
    ]);
    const human    = await IrregularPluralHuman.createQuery().first();
    const tokenIds = await IrregularPluralToken.createQuery().pluck('id');
    // Carbon.setTestNow('2018-05-01 15:16:17');
    await human.NewRelation('irregularPluralTokens').sync(tokenIds as any[]);
    const now = formatISO(new Date());
    await human.Refresh();
    expect(+human.created_at - +new Date() < 1000).toBeTruthy();
    expect(+human.updated_at - +new Date() < 1000).toBeTruthy();
    // expect(/*cast type string*/ formatISO(human.created_at)).toBe(now);
    // expect(/*cast type string*/ formatISO(human.updated_at)).toBe(now);
  });

  it('it pluralizes morph to many relationships', async () => {
    const human = await IrregularPluralHuman.createQuery().create({
      'email': 'bobby@example.com'
    });
    await human.NewRelation('mottoes').create({
      'name': 'Real eyes realize real lies'
    });
    const motto = await IrregularPluralMotto.createQuery().first();
    expect(motto.name).toBe('Real eyes realize real lies');
  });
});

@Table({
  tableName: 'irregular_plural_humans'
})
export class IrregularPluralHuman extends Model {
  _guarded: any = [];

  @PrimaryColumn()
  id: number;

  @BelongsToManyColumn({
    related        : forwardRef(() => IrregularPluralToken),
    table          : 'irregular_plural_human_irregular_plural_token',
    foreignPivotKey: 'irregular_plural_token_id',
    relatedPivotKey: 'irregular_plural_human_id'
  })
  public irregularPluralTokens: FedacoRelationListType<IrregularPluralToken>;

  @MorphToManyColumn({
    related: forwardRef(() => IrregularPluralMotto),
    name   : 'cool_motto'
  })
  public mottoes: FedacoRelationListType<IrregularPluralMotto>;

  @CreatedAtColumn()
  public created_at: Date;

  @UpdatedAtColumn()
  public updated_at: Date;
}

@Table({
  tableName    : 'irregular_plural_token',
  noPluralTable: false
})
export class IrregularPluralToken extends Model {
  _guarded: any    = [];
  _timestamps: any = false;
  _touches: any    = ['irregularPluralHumans'];

  @PrimaryColumn()
  public id: number;
}

@Table({
  tableName    : 'irregular_plural_motto',
  noPluralTable: false
})
export class IrregularPluralMotto extends Model {
  _guarded: any    = [];
  _timestamps: any = false;

  @Column()
  name: string;

  @MorphedByManyColumn({
    related: IrregularPluralHuman,
    name   : 'cool_motto'
  })
  public irregularPluralHumans: FedacoRelationType<IrregularPluralHuman>;
}
