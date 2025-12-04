
import { Column } from '../../src/annotation/column/column';
import { PrimaryColumn } from '../../src/annotation/column/primary.column';
import { BelongsToManyColumn } from '../../src/annotation/relation-column/belongs-to-many.relation-column';
import { DatabaseConfig } from '../../src/database-config';
import { Model } from '../../src/fedaco/model';
import { Pivot } from '../../src/fedaco/relations/pivot';
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
  await schema().create('roles', table => {
    table.increments('id');
    table.string('name');
  });
  await schema().create('role_user', table => {
    table.integer('user_id').withUnsigned();
    table.integer('role_id').withUnsigned();
    table.string('extra_field').withNullable();
    table.timestamps();
  });
}

describe('interacts with pivot table with custom pivot', () => {
  beforeAll(async () => {
    const db = new DatabaseConfig();
    db.addConnection({
      'driver'  : 'sqlite',
      'database': ':memory:',
    });
    db.bootFedaco();
    db.setAsGlobal();
    await createSchema();
  });

  afterAll(async () => {
    await schema().drop('users');
    await schema().drop('roles');
    await schema().drop('role_user');
  });

  it('updates existing pivot using custom class', async () => {
    const user = await User.createQuery().create({ email: 'test@example.com' });
    const role = await Role.createQuery().create({ name: 'admin' });

    // Attach initially
    await user.NewRelation('roles').attach(role.id, { extra_field: 'initial' });

    // Verify attachment
    let attachedRole = await user.NewRelation('roles').first();

    expect(attachedRole.GetRelation('pivot').extra_field).toBe('initial');

    // Update existing pivot
    await user.NewRelation('roles').updateExistingPivot(role.id, { extra_field: 'updated' } as any);

    // Verify update
    // We need to fetch again to verify DB state
    const userFresh = await User.createQuery().with('roles').find(user.id);
    attachedRole = (userFresh.roles as Role[])[0];
    
    expect((attachedRole.GetRelation('pivot') as any).extra_field).toBe('updated');
  });
});

@Table({ tableName: 'users' })
class User extends Model {
  @PrimaryColumn()
  id: number;

  @Column()
  email: string;

  @BelongsToManyColumn({
    related        : forwardRef(() => Role),
    table          : 'role_user',
    foreignPivotKey: 'user_id',
    relatedPivotKey: 'role_id',
    onQuery        : (q: any) => {
      q.using(RoleUserPivot);
      q.withPivot('extra_field');
    }
  })
  roles: FedacoRelationListType<Role>;
}

@Table({ tableName: 'roles' })
class Role extends Model {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;
}

@Table({ tableName: 'role_user' })
class RoleUserPivot extends Pivot {
  @Column()
  extra_field: string;
}
