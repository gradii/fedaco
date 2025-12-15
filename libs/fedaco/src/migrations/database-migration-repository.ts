import type { ConnectionResolverInterface } from '../interface/connection-resolver-interface';
import type { MigrationRepositoryInterface } from './migration-repository-interface';

export class DatabaseMigrationRepository implements MigrationRepositoryInterface {
  /* The database connection resolver instance. */
  _resolver: ConnectionResolverInterface;
  /* The name of the migration table. */
  _table: string;
  /* The name of the database connection to use. */
  _connection: string;

  /* Create a new database migration repository instance. */
  public constructor(resolver: ConnectionResolverInterface, table: string) {
    this._table = table;
    this._resolver = resolver;
  }

  /* Get the completed migrations. */
  public async getRan() {
    return await this.table()
      .orderBy('batch', 'asc')
      .orderBy('migration', 'asc')
      .pluck('migration') as Promise<any[]>;
  }

  /* Get the list of migrations. */
  public async getMigrations(steps: number) {
    const query = this.table().where('batch', '>=', '1');
    return query.orderBy('batch', 'desc').orderBy('migration', 'desc').take(steps).get();
  }

  /* Get the list of the migrations by batch number. */
  public async getMigrationsByBatch(batch: number) {
    return this.table().where('batch', batch).orderBy('migration', 'desc').get();
  }

  /* Get the last migration batch. */
  public async getLast() {
    const query = this.table().where('batch', await this.getLastBatchNumber());
    return query.orderBy('migration', 'desc').get();
  }

  /* Get the completed migrations with their batch numbers. */
  public async getMigrationBatches() {
    return this.table()
      .orderBy('batch', 'asc')
      .orderBy('migration', 'asc')
      .pluck('batch', 'migration');
  }

  /* Log that a migration was run. */
  public async log(file: string, batch: number) {
    const record = {
      'migration': file,
      'batch'    : batch
    };
    await this.table().insert(record);
  }

  /* Remove a migration from the log. */
  public async delete(migration: any) {
    this.table().where('migration', migration.migration).delete();
  }

  /* Get the next migration batch number. */
  public async getNextBatchNumber() {
    return (await this.getLastBatchNumber()) + 1;
  }

  /* Get the last migration batch number. */
  public async getLastBatchNumber() {
    return this.table().max('batch');
  }

  /* Create the migration repository data store. */
  public createRepository() {
    const schema = this.getConnection().getSchemaBuilder();
    schema.create(this._table, table => {
      table.increments('id');
      table.string('migration');
      table.integer('batch');
    });
  }

  /* Determine if the migration repository exists. */
  public repositoryExists() {
    const schema = this.getConnection().getSchemaBuilder();
    return schema.hasTable(this._table);
  }

  /* Delete the migration repository data store. */
  public async deleteRepository() {
    const schema = this.getConnection().getSchemaBuilder();
    await schema.drop(this._table);
  }

  /* Get a query builder for the migration table. */
  protected table() {
    return this.getConnection().table(this._table).useWriteConnection();
  }

  /* Get the connection resolver instance. */
  public getConnectionResolver() {
    return this._resolver;
  }

  /* Resolve the database connection instance. */
  public getConnection() {
    return this._resolver.connection(this._connection);
  }

  /* Set the information source to gather data. */
  public setSource(name: string) {
    this._connection = name;
  }
}
