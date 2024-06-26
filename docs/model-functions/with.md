# Function With
### basic has many eager loading

```typescript
let user: FedacoTestUser = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
await user.newRelation('posts').create({
  name: 'First Post'
});
user = await FedacoTestUser.createQuery()
  .with('posts')
  .where('email', 'linbolen@gradii.com')
  .first();
```
```typescript
const post = await FedacoTestPost.createQuery()
  .with('user')
  .where('name', 'First Post')
  .get();
```


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### basic nested self referencing has many eager loading

```typescript
let user: FedacoTestUser = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
const post: FedacoTestPost = await user.newRelation('posts').create({
  name: 'First Post'
});
await post.newRelation('childPosts').create({
  name: 'Child Post',
  user_id: user.id
});
user = await FedacoTestUser.createQuery()
  .with('posts.childPosts')
  .where('email', 'linbolen@gradii.com')
  .first();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(await user.posts).name` | exactly match | `'First Post'` |
> | `head(await head(await user.posts).childPosts)` | exactly not match | `null` |
> | `head(await head(await user.posts).childPosts as any[]).name` | exactly match | `'Child Post'` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `(await head(posts).parentPost)` | exactly not match | `null` |
> | `(await head(posts).parentPost).user` | exactly not match | `null` |
> | `(await head(posts).parentPost).user.email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### belongs to many custom pivot

```typescript
const john = await FedacoTestUserWithCustomFriendPivot.createQuery().create({
  id: 1,
  name: 'John Doe',
  email: 'johndoe@example.com'
});
const jane = await FedacoTestUserWithCustomFriendPivot.createQuery().create({
  id: 2,
  name: 'Jane Doe',
  email: 'janedoe@example.com'
});
const jack = await FedacoTestUserWithCustomFriendPivot.createQuery().create({
  id: 3,
  name: 'Jack Doe',
  email: 'jackdoe@example.com'
});
const jule = await FedacoTestUserWithCustomFriendPivot.createQuery().create({
  id: 4,
  name: 'Jule Doe',
  email: 'juledoe@example.com'
});
await FedacoTestFriendLevel.createQuery().create({
  id: 1,
  level: 'acquaintance'
});
await FedacoTestFriendLevel.createQuery().create({
  id: 2,
  level: 'friend'
});
await FedacoTestFriendLevel.createQuery().create({
  id: 3,
  level: 'bff'
});
await john.newRelation('friends').attach(jane, {
  friend_level_id: 1
});
await john.newRelation('friends').attach(jack, {
  friend_level_id: 2
});
await john.newRelation('friends').attach(jule, {
  friend_level_id: 3
});
const johnWithFriends = await FedacoTestUserWithCustomFriendPivot.createQuery()
  .with('friends')
  .find(1);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `await (await johnWithFriends.friends.find(it => it.id === 3).getAttribute(      'pivot').level).level` | exactly match | `'friend'` |
> | `(await johnWithFriends.friends.find(it => it.id === 4).getAttribute(      'pivot').friend).name` | exactly match | `'Jule Doe'` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### eager loaded morph to relations on another database connection

```typescript
await FedacoTestPost.createQuery().create({
  id: 1,
  name: 'Default Connection Post',
  user_id: 1
});
await FedacoTestPhoto.createQuery().create({
  id: 1,
  imageable_type: 'post',
  imageable_id: 1,
  name: 'Photo'
});
await FedacoTestPost.useConnection('second_connection').create({
  id: 1,
  name: 'Second Connection Post',
  user_id: 1
});
await FedacoTestPhoto.useConnection('second_connection').create({
  id: 1,
  imageable_type: 'post',
  imageable_id: 1,
  name: 'Photo'
});
const defaultConnectionPost = (
  await FedacoTestPhoto.createQuery().with('imageable').first()
).imageable;
const secondConnectionPost = (
  await FedacoTestPhoto.useConnection('second_connection')
    .with('imageable')
    .first()
).imageable;
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `'Second Connection Post'` | match | `secondConnectionPost.name` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)
