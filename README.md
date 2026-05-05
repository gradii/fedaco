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
    declare id;
    
    @Column()
    declare email;
  
    @Column()
    declare name;
  
    @Column()
    declare age;
  
    @CreatedAtColumn()
    declare created_at;
  
    @UpdateAtColumn()
    declare updated_at;
  }
  ```
- fetch data
  ```typescript
  const list = await User.createQuery().get();
  ```

### Create Table

#### create a user table.

  ```typescript
  await schema().create('users', table => {
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
- sqlite, mysql, postgresql support


### Notice
When `target` is `es2022` or higher, TypeScript uses the modern ECMAScript class fields semantics by default, so plain field declarations outside the constructor are no longer supported (unlike `es2016`~`es2021`).

**Workaround** – use the `declare` keyword to keep fields only in the constructor:

```typescript
  @Table({
    tableName: 'user'
  })
  class User extends Model {
    @PrimaryColumn()
    declare id;
  }
  ```
