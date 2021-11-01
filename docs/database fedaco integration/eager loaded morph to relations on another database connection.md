## eager loaded morph to relations on another database connection

```typescript
await FedacoTestPost.createQuery().create({
      'id'     : 1,
      'name'   : 'Default Connection Post',
      'user_id': 1
    });
await FedacoTestPhoto.createQuery().create({
      'id'            : 1,
      'imageable_type': 'post',
      'imageable_id'  : 1,
      'name'          : 'Photo'
    });
await FedacoTestPost.useConnection('second_connection').create({
      'id'     : 1,
      'name'   : 'Second Connection Post',
      'user_id': 1
    });
await FedacoTestPhoto.useConnection('second_connection').create({
      'id'            : 1,
      'imageable_type': 'post',
      'imageable_id'  : 1,
      'name'          : 'Photo'
    });
const defaultConnectionPost = (
      await FedacoTestPhoto.createQuery().with('imageable').first()
    ).imageable;
const secondConnectionPost  = (
      await FedacoTestPhoto.useConnection('second_connection').with('imageable').first()
    ).imageable;
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
