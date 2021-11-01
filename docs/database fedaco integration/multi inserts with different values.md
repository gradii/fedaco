## multi inserts with different values

```typescript
const date   = '1970-01-01';
const result = await FedacoTestPost.createQuery().insert([
      {
        'user_id'   : 1,
        'name'      : 'Post',
        'created_at': date,
        'updated_at': date
      }, {
        'user_id'   : 2,
        'name'      : 'Post',
        'created_at': date,
        'updated_at': date
      }
    ]);
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
