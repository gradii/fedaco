# Extract DB drivers out of `@gradii/fedaco` into separate libs

## Context

Today `libs/fedaco/src/` ships every database driver in-tree: sqlite (better-sqlite3 + sqlite3), mysql/mariadb (mysql2), postgres (pg), sqlserver (tedious). The fedaco `package.json` lists those packages as direct dependencies, every install pulls in five native/binary clients regardless of which one the consumer uses, and `connector/connection-factory.ts` hardcodes `switch (driver)` over the four built-in drivers — there is no way to add a new driver without forking the lib.

The goal of this refactor: move each driver into its own publishable nx lib (`libs/<driver>-driver`), and turn `ConnectionFactory` into a dispatch over a per-connection factory object provided in `addConnection({ driver, factory, ... })`. The `driver` string field stays required (grammars and `MysqlConnection.isMaria()` branch on it), but the actual classes/external packages are no longer in fedaco's dependency graph.

Confirmed with the user:
- API style: **per-config driver factory** — `addConnection({ driver: 'sqlite', factory: sqliteDriver(), ... })`.
- Scope: **all four drivers in one PR** (sqlite, mysql incl. mariadb, postgres, sqlserver).
- `index.ts`: **drop driver re-exports** — clean break, consumers import from the new packages.

## Architecture

### New `DatabaseDriver` contract — added to `libs/fedaco/src/`

```ts
// libs/fedaco/src/interface/database-driver.ts (new)
export interface DatabaseDriver {
  /** Driver name; must match the `driver` field in ConnectionConfig. */
  readonly name: string;
  createConnector(): ConnectorInterface;
  createConnection(
    pdo: Function,
    database: string,
    prefix: string,
    config: any,
  ): Connection;
}
```

### `ConnectionConfig` — extend in `libs/fedaco/src/database-config.ts`

```ts
export type ConnectionConfig = {
  driver: string;            // still required — keys grammars / version checks
  factory: DatabaseDriver;   // NEW — produced by sqliteDriver(), mysqlDriver(), etc.
  database?: string;
  // …existing fields unchanged
};
```

### `ConnectionFactory` — rewrite in `libs/fedaco/src/connector/connection-factory.ts`

- Drop the four imports of `MysqlConnector`, `PostgresConnector`, `SqliteConnector`, `SqlServerConnector`.
- Drop the four imports of `MysqlConnection`, `PostgresConnection`, `SqliteConnection`, `SqlServerConnection`.
- `createConnector(config)` → `return config.factory.createConnector()` (with a clear error if `factory` is missing).
- `createConnection(driver, pdo, db, prefix, config)` → keep the existing `Connection.getResolver(driver)` lookup (still useful for advanced overrides), then fall through to `config.factory.createConnection(pdo, db, prefix, config)`. Remove the hardcoded driver switch.

`Connection.resolverFor` / `Connection.getResolver` (libs/fedaco/src/connection.ts:714-720) stay as the override hook — already a registry, no change needed.

## New lib layout

Each driver lib is generated with `pnpm nx g @nx/node:lib libs/<name>` and follows the existing template (see `libs/nest-fedaco/project.json`, `libs/fedaco/package.json` for shape):

```
libs/sqlite-driver/
  package.json          # name: @gradii/fedaco-sqlite-driver
                        # deps: better-sqlite3, sqlite3
                        # peerDeps: @gradii/fedaco
  project.json          # build: @nx/js:tsc → dist/libs/sqlite-driver
  tsconfig.json / tsconfig.lib.json / tsconfig.spec.json
  jest.config.ts
  src/
    index.ts                                # exports sqliteDriver() + classes
    sqlite-driver.ts                        # factory function
    connector/
      sqlite-connector.ts                   # moved from fedaco/src/connector/sqlite/
      sqlite-wrapped-connection.ts
      sqlite-wrapped-stmt.ts
      better-sqlite/
        better-sqlite-wrapped-connection.ts
        better-sqlite-wrapped-stmt.ts
    connection/
      sqlite-connection.ts                  # moved from fedaco/src/connection/
    query-builder/
      sqlite-query-grammar.ts               # moved from fedaco/src/query-builder/grammar/
      sqlite-processor.ts                   # moved from fedaco/src/query-builder/processor/
      sqlite-query-builder-visitor.ts       # moved from fedaco/src/query-builder/visitor/
    schema/
      sqlite-schema-grammar.ts              # moved from fedaco/src/schema/grammar/
      sqlite-schema-builder.ts              # moved from fedaco/src/schema/builder/
      sqlite-schema-state.ts                # moved from fedaco/src/schema/
```

Same shape for the other three:

| Lib | Package | npm deps moved out of fedaco | Driver names |
| --- | --- | --- | --- |
| `libs/sqlite-driver` | `@gradii/fedaco-sqlite-driver` | `better-sqlite3`, `sqlite3` | `sqlite` |
| `libs/mysql-driver` | `@gradii/fedaco-mysql-driver` | `mysql2` | `mysql`, `mariadb` (also moves `schema/grammar/mariadb-schema-grammar.ts` + `schema/builder/mariadb-schema-builder.ts`; both already import `MysqlConnection`) |
| `libs/postgres-driver` | `@gradii/fedaco-postgres-driver` | `pg` | `pgsql` |
| `libs/sqlserver-driver` | `@gradii/fedaco-sqlserver-driver` | `tedious` | `sqlsrv` |

### Driver factory (sqlite shown; others identical pattern)

```ts
// libs/sqlite-driver/src/sqlite-driver.ts
import type { DatabaseDriver } from '@gradii/fedaco';
import { SqliteConnection } from './connection/sqlite-connection';
import { SqliteConnector } from './connector/sqlite-connector';

export function sqliteDriver(): DatabaseDriver {
  return {
    name: 'sqlite',
    createConnector: () => new SqliteConnector(),
    createConnection: (pdo, db, prefix, cfg) =>
      new SqliteConnection(pdo, db, prefix, cfg),
  };
}
```

The mysql lib exports both `mysqlDriver()` and `mariadbDriver()` — both build a `MysqlConnector` + `MysqlConnection`, only the `name` differs (drives grammar branching for version checks in `mariadb-schema-grammar.ts`).

## Files modified in `libs/fedaco/`

### Edited
- `libs/fedaco/src/connector/connection-factory.ts` — rewrite as described above.
- `libs/fedaco/src/database-config.ts` — extend `ConnectionConfig` with `factory: DatabaseDriver`.
- `libs/fedaco/src/database-manager.ts` — top of file constructs `new MysqlQueryGrammar()` for an inner placeholder `Conn` (around line 16). Swap to a small in-tree default — likely a noop subclass of `QueryGrammar`. Verify the placeholder is reachable; if not, delete it.
- `libs/fedaco/src/index.ts` — drop the ~30 driver-specific re-exports (every line referencing `mysql-`, `sqlite-`, `postgres-`, `sql-server-`, `sqlserver-`, `mariadb-`, `connector/sqlite/`, `connector/mysql/`, `connector/postgres/`, `connector/sqlserver/`). Add export of the new `DatabaseDriver` interface.
- `libs/fedaco/package.json` — drop `better-sqlite3`, `sqlite3`, `mysql2`, `pg`, `tedious` from dependencies.
- `package.json` (root) — those packages can stay at the workspace level as devDependencies (used for tests across libs); decide during execution.
- `tsconfig.base.json` — add path aliases for the four new packages (`@gradii/fedaco-sqlite-driver` → `libs/sqlite-driver/src/index.ts`, etc.).

### Added
- `libs/fedaco/src/interface/database-driver.ts` — the `DatabaseDriver` interface.

### Deleted (entire files; their content moves to the driver libs)
- `libs/fedaco/src/connector/sqlite/` (whole dir incl. `better-sqlite/`)
- `libs/fedaco/src/connector/mysql/`, `connector/postgres/`, `connector/sqlserver/`, `connector/mariadb/`
- `libs/fedaco/src/connection/mysql-connection.ts`, `sqlite-connection.ts`, `postgres-connection.ts`, `sql-server-connection.ts`
- `libs/fedaco/src/query-builder/grammar/{mysql,sqlite,postgres,sqlserver}-query-grammar.ts` (keep `query-grammar.ts` and `oracle-query-grammar.ts`)
- `libs/fedaco/src/query-builder/processor/{mysql,sqlite,postgres,sql-server}-processor.ts` (keep base `processor.ts`)
- `libs/fedaco/src/query-builder/visitor/{mysql,sqlite,postgres,sqlserver}-query-builder-visitor.ts` (keep `query-builder-visitor.ts`)
- `libs/fedaco/src/schema/grammar/{mysql,mariadb,postgres,sqlite,sql-server}-schema-grammar.ts` (keep `schema-grammar.ts`)
- `libs/fedaco/src/schema/builder/{mysql,mariadb,postgres,sqlite,sql-server}-schema-builder.ts`
- `libs/fedaco/src/schema/{mysql,postgres,sqlite}-schema-state.ts` (keep `schema-state.ts`)

## Downstream call sites — update to the new API

These pass configs to `DatabaseConfig.addConnection(config, name)`. Each must add a `factory:` field and import the driver lib.

- `apps/fedaco-cli/src/app/migrator.service.ts:34` — driven by user config; load the appropriate factory based on `cfg.driver` (the CLI is a thin wrapper, so a small switch over driver string → factory call is acceptable here, since the CLI legitimately needs to pick at runtime).
- `libs/nest-fedaco/src/fedaco-core.module.ts:46` — same shape; document that consumers must include `factory` in the `ConnectionConfig` they hand to the module.
- `apps/nest-postgresql/`, `apps/nest-startkit/`, `apps/polymorphic/` — verify and update their connection setup.

## Tests — update in place

- `libs/fedaco/test/fedaco-integration.spec.ts` — uses sqlite. Update its `addConnection` call to `{ driver: 'sqlite', factory: sqliteDriver(), database: ':memory:' }`. Imports move from `../src/...` to `@gradii/fedaco-sqlite-driver`.
- `libs/fedaco/test/fedaco-mysql-integration.spec.ts`, `fedaco-postgresql-integration.spec.ts` — same treatment for mysql / postgres.
- `libs/fedaco/test/connections/` — driver-specific connection specs. They reference classes that have moved; update imports to the new packages.
- `libs/fedaco/test/schema-grammar/` — likely imports the schema-grammar classes; update imports to driver libs.

Each new driver lib also gets a thin `*-driver.spec.ts` that verifies `xxxDriver()` returns the correct `name` and produces working connector + connection instances.

## Verification

1. `pnpm nx run-many -t build` — all five libs (fedaco + four drivers) build cleanly.
2. `pnpm nx run-many -t lint` — clean.
3. `pnpm nx test fedaco` — existing fedaco unit + integration tests pass against the new factory API.
4. `pnpm nx test sqlite-driver` (and the other three) — driver-factory smoke specs pass.
5. `pnpm nx run polymorphic:serve` (or whichever app exercises end-to-end persistence) — boots and can read/write against its configured driver.
6. `node -e "require('@gradii/fedaco/package.json').dependencies"` shows none of `better-sqlite3 / sqlite3 / mysql2 / pg / tedious`.
7. Quick consumer smoke: in a scratch script, `import { sqliteDriver }` from the published path, build a `DatabaseConfig` with `factory: sqliteDriver()`, run a `SELECT 1` round-trip.

## Out of scope

- No behavior changes inside any driver — just relocation + factory wiring.
- `Connection.resolverFor` / `getResolver` extension hook untouched (still works for advanced overrides on top of the per-config factory).
- No npm publishing / version bumping.
- The `query-builder/grammar/oracle-query-grammar.ts` file stays in fedaco — there is no oracle driver lib in this PR.
