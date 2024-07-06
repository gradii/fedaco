# Fedaco Orm

[![Build Status](https://github.com/gradii/fedaco/workflows/CI/badge.svg)](https://github.com/gradii/fedaco/actions?query=workflow%3ACI)

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
- [ ] postgres full support
- [ ] mssql full support
- [ ] migration


### Notice
ecma class with field declaration not in constructor is not support. es2016 is support but es2022 is not.
field declaration can use `declare` keyword to declare field in constructor, then the field will not generated in class when enabled es2022
like this
```typescript
  @Table({
    tableName: 'user'
  })
  class User extends Model {
    @PrimaryColumn()
    declare id;
  }
  ```
