// Fedaco config for the fedaco CLI.
// Loaded by `pnpm nx serve fedaco-cli` from the workspace root (cwd).
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
