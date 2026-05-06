# Migration Guide

This guide documents the Fedaco migration CLI in this repository.

## Build The CLI

In this monorepo, build the CLI first:

```sh
pnpm build:cli
```

This builds `apps/fedaco-cli` and installs the executable at:

`dist/libs/fedaco/bin/fedaco.js`

## Configure `fedaco.config.js`

Create `fedaco.config.js` in your project root:

```js
module.exports = {
  defaultConnection: 'default',
  migrationsPath: './database/migrations',
  migrationsTable: 'migrations',
  connections: {
    default: {
      driver: 'sqlite',
      database: './tmp/fedaco.sqlite',
    },
  },
};
```

`connections` is passed into `DatabaseConfig.addConnection(...)`.

## Run Commands

Use package manager command form:

::: code-group

```sh [pnpm]
pnpm fedaco migrate:install
pnpm fedaco migrate:make create_users_table --create users
pnpm fedaco migrate
pnpm fedaco migrate:status
```

```sh [npm]
npm fedaco migrate:install
npm fedaco migrate:make create_users_table --create users
npm fedaco migrate
npm fedaco migrate:status
```

```sh [yarn]
yarn fedaco migrate:install
yarn fedaco migrate:make create_users_table --create users
yarn fedaco migrate
yarn fedaco migrate:status
```

:::

## Common Examples

::: code-group

```sh [pnpm]
pnpm fedaco migrate:rollback --step 1
pnpm fedaco migrate:refresh
pnpm fedaco migrate:fresh
```

```sh [npm]
npm fedaco migrate:rollback --step 1
npm fedaco migrate:refresh
npm fedaco migrate:fresh
```

```sh [yarn]
yarn fedaco migrate:rollback --step 1
yarn fedaco migrate:refresh
yarn fedaco migrate:fresh
```

## Command Reference

`migrate`:
- Run pending migrations.
- Options: `--path <path>`, `--pretend`, `--step [step]`

`migrate:install`:
- Create migration repository table if missing.

`migrate:make <name>`:
- Generate migration file.
- Options: `--path <path>`, `--table <table>`, `--create [table]`

`migrate:status`:
- Show `Ran`, `Pending`, and `Missing` migration states.
- Option: `--path <path>`

`migrate:rollback`:
- Roll back latest migration batch or configured step.
- Options: `--path <path>`, `--pretend`, `--step <step>`, `--batch <batch>`

`migrate:reset`:
- Roll back all migrations.
- Options: `--path <path>`, `--pretend`

`migrate:refresh`:
- Reset then run migrations again.
- Options: `--path <path>`, `--pretend`, `--step [step]`

`migrate:fresh`:
- Drop all tables (if supported) then run migrations.
- Options: `--path <path>`, `--pretend`, `--step [step]`

## Typical Workflow

```sh
# 1) build cli
pnpm build:cli

# 2) create migration
pnpm fedaco migrate:make create_posts_table --create posts

# 3) run migration
pnpm fedaco migrate

# 4) check status
pnpm fedaco migrate:status
```
