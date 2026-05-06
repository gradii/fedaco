# E2E Scenario: Schema Operations

This guide is derived from `apps/fedaco-e2e/src/test/schema-operate.spec.ts`.

## Bootstrap And Schema Helper

```ts
import { DatabaseConfig, Model, type SchemaBuilder } from '@gradii/fedaco';
import { betterSqliteDriver } from '@gradii/fedaco-sqlite-driver';

function connection(connectionName = 'default') {
  return Model.getConnectionResolver().connection(connectionName);
}

function schema(connectionName = 'default'): SchemaBuilder {
  return connection(connectionName).getSchemaBuilder();
}
```

## Create Table

```ts
await schema('default').create('test_orders', (table) => {
  table.increments('id');
  table.string('item_type');
  table.integer('item_id');
  table.timestamps();
});
```

## Read Back Schema Info

```ts
const tableList = await schema().getTables();
const tableExist = await schema('default').hasTable('test_orders');
```

This is the exact e2e pattern used to verify schema creation and table visibility.
