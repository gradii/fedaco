# Function New Relation
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

### basic morph many relationship

```typescript
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
await user.newRelation('photos').create({
  name: 'Avatar 1'
});
await user.newRelation('photos').create({
  name: 'Avatar 2'
});
const post = await user.newRelation('posts').create({
  name: 'First Post'
});
await post.newRelation('photos').create({
  name: 'Hero 1'
});
await post.newRelation('photos').create({
  name: 'Hero 2'
});
const userPhotos = await user.photos;
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `isArray(await user.photos)` | exactly match | `true` |
> | `(await user.photos)[0]` | type exactly match | `FedacoTestPhoto` |
> | `isArray(await post.photos)` | exactly match | `true` |
> | `(await post.photos)[0]` | type exactly match | `FedacoTestPhoto` |
> | `(await user.photos).length` | exactly match | `2` |
> | `(await post.photos).length` | exactly match | `2` |
> | `(await user.photos)[0].name` | exactly match | `'Avatar 1'` |
> | `(await user.photos)[1].name` | exactly match | `'Avatar 2'` |
> | `(await post.photos)[0].name` | exactly match | `'Hero 1'` |
> | `(await post.photos)[1].name` | exactly match | `'Hero 2'` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `isArray(photos)` | exactly match | `true` |
> | `photos.length` | exactly match | `4` |
> | `await photos[0].imageable` | type exactly match | `FedacoTestUser` |
> | `await photos[2].imageable` | type exactly match | `FedacoTestPost` |
> | `(await photos[1].imageable).email` | exactly match | `'linbolen@gradii.com'` |
> | `(await photos[3].imageable).name` | exactly match | `'First Post'` |


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

### count for pagination with grouping and sub selects

```typescript
const user1 = await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await FedacoTestUser.createQuery().create({
  id: 2,
  email: 'xsilen@gradii.com'
});
await FedacoTestUser.createQuery().create({
  id: 3,
  email: 'foo@gmail.com'
});
await FedacoTestUser.createQuery().create({
  id: 4,
  email: 'foo@gmail.com'
});
const friendsRelation = user1.newRelation('friends');
await friendsRelation.create({
  id: 5,
  email: 'friend@gmail.com'
});
const query = await FedacoTestUser.createQuery()
  .select({
    0: 'id',
    friends_count: await FedacoTestUser.createQuery()
      .whereColumn('friend_id', 'user_id')
      .count()
  })
  .groupBy('email')
  .getQuery();
```


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### has on nested self referencing belongs to many relationship with where pivot

```typescript
const user = await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
const friend = await user.newRelation('friends').create({
  id: 2,
  email: 'xsilen@gradii.com'
});
await friend.newRelation('friends').create({
  id: 3,
  email: 'foo@gmail.com'
});
const results = await FedacoTestUser.createQuery()
  .has('friendsOne.friendsTwo')
  .get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### has on nested self referencing belongs to many relationship

```typescript
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
const friend = await user.newRelation('friends').create({
  email: 'xsilen@gradii.com'
});
await friend.newRelation('friends').create({
  email: 'foo@gmail.com'
});
const results = await FedacoTestUser.createQuery().has('friends.friends').get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### has on self referencing belongs to many relationship with where pivot

```typescript
const user = await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await user.newRelation('friends').create({
  id: 2,
  email: 'xsilen@gradii.com'
});
const results = await FedacoTestUser.createQuery().has('friendsOne').get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### has on self referencing belongs to many relationship

```typescript
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
await user.newRelation('friends').create({
  email: 'xsilen@gradii.com'
});
```
```typescript
const results = await FedacoTestUser.createQuery().has('friends').get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### has with non where bindings

```typescript
const user = await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await (
  await user.newRelation('posts').create({
    name: 'Post 2'
  })
)
  .newRelation('photos')
  .create({
    name: 'photo.jpg'
  });
const query = await FedacoTestUser.createQuery().has('postWithPhotos');
const { result: sql, bindings } = query.toSql();
const bindingsCount = bindings.length;
const questionMarksCount = sql.match(/\?/g)?.length || 0;
```


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### isset loads in relationship if it isnt loaded already

```typescript
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
await user.newRelation('post').create({
  name: 'First Post'
});
```


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### morph map is used for creating and fetching through relation

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
await user.newRelation('photos').create({
  name: 'Avatar 2'
});
const post = await user.newRelation('posts').create({
  name: 'First Post'
});
await post.newRelation('photos').create({
  name: 'Hero 1'
});
await post.newRelation('photos').create({
  name: 'Hero 2'
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `(await user.photos)[0]` | type exactly match | `FedacoTestPhoto` |
> | `isArray(await post.photos)` | exactly match | `true` |
> | `(await post.photos)[0]` | type exactly match | `FedacoTestPhoto` |
> | `(await user.photos).length` | exactly match | `2` |
> | `(await post.photos).length` | exactly match | `2` |
> | `(await user.photos)[0].name` | exactly match | `'Avatar 1'` |
> | `(await user.photos)[1].name` | exactly match | `'Avatar 2'` |
> | `(await post.photos)[0].name` | exactly match | `'Hero 1'` |
> | `(await post.photos)[1].name` | exactly match | `'Hero 2'` |
> | `(await user.photos)[0].getAttribute('imageable_type')` | exactly match | `'user'` |
> | `(await user.photos)[1].getAttribute('imageable_type')` | exactly match | `'user'` |
> | `(await post.photos)[0].getAttribute('imageable_type')` | exactly match | `'post'` |
> | `(await post.photos)[1].getAttribute('imageable_type')` | exactly match | `'post'` |


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
> | `await photo.imageable` | type exactly match | `FedacoTestUser` |


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
> | `posts[0]` | type exactly match | `FedacoTestPost` |
> | `posts[1]` | type exactly match | `FedacoTestPost` |
> | `post2` | type exactly match | `FedacoTestPost` |
> | `post2.name` | exactly match | `'Second Post'` |
> | `await post2.user` | type exactly match | `FedacoTestUser` |
> | `(await post2.user).email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### pluck with join

```typescript
const user1 = await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
const user2 = await FedacoTestUser.createQuery().create({
  id: 2,
  email: 'xsilen@gradii.com'
});
await user2.newRelation('posts').create({
  id: 1,
  name: 'First post'
});
await user1.newRelation('posts').create({
  id: 2,
  name: 'Second post'
});
const query = FedacoTestUser.createQuery().join(
  'posts',
  'users.id',
  '=',
  'posts.user_id'
);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `await query.pluck('posts.name', 'users.id')` | match | `({
      2: 'First post',
      1: 'Second post'
    });` |
> | `await query.pluck('posts.name', 'users.email AS user_email')` | match | `({
      'xsilen@gradii.com': 'First post',
      'linbolen@gradii.com' : 'Second post'
    });` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### where has on nested self referencing belongs to many relationship

```typescript
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
const friend = await user.newRelation('friends').create({
  email: 'xsilen@gradii.com'
});
await friend.newRelation('friends').create({
  email: 'foo@gmail.com'
});
const results: FedacoTestUser[] = await FedacoTestUser.createQuery()
  .whereHas('friends.friends', (query) => {
    query.where('email', 'foo@gmail.com');
  })
  .get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### where has on self referencing belongs to many relationship

```typescript
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
await user.newRelation('friends').create({
  email: 'xsilen@gradii.com'
});
const results: FedacoTestUser[] = await FedacoTestUser.createQuery()
  .whereHas('friends', (query) => {
    query.where('email', 'xsilen@gradii.com');
  })
  .get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")
