// Sample fedaco config for the fedaco CLI.
// Copy this to your project root as `fedaco.config.js` and adjust.
module.exports = {
  // Optional: name of the connection used for the migrations table itself.
  defaultConnection: 'default',

  // Where migration files live, relative to cwd.
  migrationsPath: './database/migrations',

  // Migration log table.
  migrationsTable: 'migrations',

  // Connections passed straight into FedacoModule.forRoot().
  connections: {
    default: {
      driver: 'sqlite',
      database: './tmp/fedaco.sqlite',
    },
    // mysql: {
    //   driver: 'mysql',
    //   host: '127.0.0.1',
    //   port: 3306,
    //   database: 'app',
    //   username: 'root',
    //   password: '',
    // },
  },
};
