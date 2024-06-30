# Fedaco Orm

###
No short description right now.
can play fedaco here https://github.com/gradii/play-fedaco

### How To Use It

- setup a connection
  ```typescript
  const db = new DatabaseConfig();
  db.addConnection({
    'driver'  : 'sqlite',
    'database': ':memory:'
  });
  db.bootFedaco();
  db.setAsGlobal();
  ```
- define a model
  ```typescript
  @Table({
    tableName: 'user'
  })
  class User extends Model {
    @PrimaryColumn
    id;
    
    @Column()
    email;
  
    @Column()
    name;
  
    @Column()
    age;
  
    @CreatedAtColumn()
    created_at;
  
    @UpdateAtColumn()
    updated_at;
  }
  ```
- fetch data
  ```typescript
  const list = await User.createQuery().get();
  ```

### Create Table

#### create a user table.

  ```typescript
  const schemaBuilder = Model.getConnectionResolver()
    .connection(connectionName)
    .getSchemaBuilder();
  ;
  
  await schemaBuilder().create('users', table => {
    table.increments('id');
    table.string('email').withUnique();
    table.string('name');
    table.string('age');
  });
  ```

### Features
- wrapped driver. unify all driver query api
- compile query builder to sql
- decorate to define model
- soft delete
- use relationship to link model
- relation can set dynamic constrain
- sqlite and mysql support

### Progressing
- [x] postgres full support
- [ ] mssql full support
- [ ] migration

