# Function first
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
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### basic model retrieval

```typescript
const factory = new FedacoTestUser();
await factory.newQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await factory.newQuery().create({
  id: 2,
  email: 'xsilen@gradii.com'
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `      await factory.newQuery().where('email', 'linbolen@gradii.com').doesntExist()` | exactly match false | `();` |
> | `      await factory.newQuery().where('email', 'mohamed@laravel.com').doesntExist()` | exactly match | `true` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `model.email` | exactly match | `'linbolen@gradii.com'` |
> | `model.email !== undefined` | exactly match | `true` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `friends !== undefined` | exactly match | `true` |
> | `friends` | match | `[]` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `model` | instance type exactly match | `FedacoTestUser` |
> | `model.id` | match | `1` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `model` | instance type exactly match | `FedacoTestUser` |
> | `model.id` | match | `2` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `missing` | exactly match | `Undefined();` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `isArray(collection)` | exactly match | `true` |
> | `collection.length` | exactly match | `0` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `isArray(collection)` | exactly match | `true` |
> | `collection.length` | exactly match | `2` |
```typescript
// .cursor();
for (const m of models) {
  expect(m.id).toEqual(1);
  expect(m.getConnectionName()).toBe('default');
}
```


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

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
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### belongs to many relationship models are properly hydrated over chunked request

```typescript
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
const friend = await user.newRelation('friends').create({
  email: 'xsilen@gradii.com'
});
const user1: FedacoTestUser = await FedacoTestUser.createQuery().first();
await user1
  .newRelation('friends')
  .chunk(2)
  .pipe(
    tap(({ results: friends }) => {
      expect(friends.length).toBe(1);
      expect(head(friends).email).toBe('xsilen@gradii.com');
      expect(head(friends).getRelation('pivot').getAttribute('user_id')).toBe(
        user.id
      );
      expect(head(friends).getRelation('pivot').getAttribute('friend_id')).toBe(
        friend.id
      );
    })
  )
  .toPromise();
```


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### belongs to many relationship models are properly hydrated over each request

```typescript
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
const friend = await user.newRelation('friends').create({
  email: 'xsilen@gradii.com'
});
await (
  await FedacoTestUser.createQuery().first()
)
  .newRelation('friends')
  .each()
  .pipe(
    tap(({ item: result, index }) => {
      expect(result.email).toBe('xsilen@gradii.com');
      expect(result.getAttribute('user_id')).toBe(user.id);
      expect(result.getAttribute('friend_id')).toBe(friend.id);
    })
  )
  .toPromise();
```


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

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
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### for page after id correctly paginates

```typescript
await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await FedacoTestUser.createQuery().create({
  id: 2,
  email: 'xsilen@gradii.com'
});
let results = await FedacoTestUser.createQuery().forPageAfterId(15, 1);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `(await results.first()).id` | match | `2` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `results` | instance type exactly match | `FedacoBuilder` |
> | `(await results.first()).id` | match | `2` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### incrementing primary keys are cast to integers by default

```typescript
await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
const user = await FedacoTestUser.createQuery().first();
```


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### morph map is used when fetching parent

```typescript
Relation.morphMap({
  user: FedacoTestUser,
  post: FedacoTestPost
});
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
await user.newRelation('photos').create({
  name: 'Avatar 1'
});
const photo = await FedacoTestPhoto.createQuery().first();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `await photo.imageable` | instance type exactly match | `FedacoTestUser` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### morph to relations across database connections

```typescript
let item = null;
await FedacoTestItem.createQuery().create({
  id: 1
});
await FedacoTestOrder.createQuery().create({
  id: 1,
  item_type: 'FedacoTestItem',
  item_id: 1
});
try {
  const order = await FedacoTestOrder.createQuery().first();
  item = order.item;
} catch (e) {
  console.log(e);
}
```


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### one to many relationship

```typescript
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
await user.newRelation('posts').create({
  name: 'First Post'
});
await user.newRelation('posts').create({
  name: 'Second Post'
});
const posts = await user.posts;
const post2 = await user
  .newRelation('posts')
  .where('name', 'Second Post')
  .first();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `posts.length` | exactly match | `2` |
> | `posts[0]` | instance type exactly match | `FedacoTestPost` |
> | `posts[1]` | instance type exactly match | `FedacoTestPost` |
> | `post2` | instance type exactly match | `FedacoTestPost` |
> | `post2.name` | exactly match | `'Second Post'` |
> | `await post2.user` | instance type exactly match | `FedacoTestUser` |
> | `(await post2.user).email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")
