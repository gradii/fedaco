## belongs to many custom pivot

```typescript
const john = await FedacoTestUserWithCustomFriendPivot.createQuery().create({
      'id'   : 1,
      'name' : 'John Doe',
      'email': 'johndoe@example.com'
    });
const jane = await FedacoTestUserWithCustomFriendPivot.createQuery().create({
      'id'   : 2,
      'name' : 'Jane Doe',
      'email': 'janedoe@example.com'
    });
const jack = await FedacoTestUserWithCustomFriendPivot.createQuery().create({
      'id'   : 3,
      'name' : 'Jack Doe',
      'email': 'jackdoe@example.com'
    });
const jule = await FedacoTestUserWithCustomFriendPivot.createQuery().create({
      'id'   : 4,
      'name' : 'Jule Doe',
      'email': 'juledoe@example.com'
    });
await FedacoTestFriendLevel.createQuery().create({
      'id'   : 1,
      'level': 'acquaintance'
    });
await FedacoTestFriendLevel.createQuery().create({
      'id'   : 2,
      'level': 'friend'
    });
await FedacoTestFriendLevel.createQuery().create({
      'id'   : 3,
      'level': 'bff'
    });
await john.newRelation('friends').attach(jane, {
      'friend_level_id': 1
    });
await john.newRelation('friends').attach(jack, {
      'friend_level_id': 2
    });
await john.newRelation('friends').attach(jule, {
      'friend_level_id': 3
    });
const johnWithFriends = await FedacoTestUserWithCustomFriendPivot.createQuery()
      .with('friends').find(1);
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
