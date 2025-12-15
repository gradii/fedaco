export interface MigrationRepositoryInterface {
  /* Get the completed migrations. */
  getRan(): Promise<any[]>;

  /* Get the list of migrations. */
  getMigrations(steps: number): Promise<any[]>;

  /* Get the list of the migrations by batch. */
  getMigrationsByBatch(batch: number);

  /* Get the last migration batch. */
  getLast();

  /* Get the completed migrations with their batch numbers. */
  getMigrationBatches();

  /* Log that a migration was run. */
  log(file: string, batch: number);

  /* Remove a migration from the log. */
  delete(migration: object);

  /* Get the next migration batch number. */
  getNextBatchNumber();

  /* Create the migration repository data store. */
  createRepository();

  /* Determine if the migration repository exists. */
  repositoryExists(): Promise<boolean>;

  /* Delete the migration repository data store. */
  deleteRepository(): Promise<void>;

  /* Set the information source to gather data. */
  setSource(name: string);
}
