# Function getAttribute
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
> | `(await user.photos)[0]` | instance type exactly match | `FedacoTestPhoto` |
> | `isArray(await post.photos)` | exactly match | `true` |
> | `(await post.photos)[0]` | instance type exactly match | `FedacoTestPhoto` |
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
> | `await photo.imageable` | instance type exactly match | `FedacoTestUser` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### timestamps using custom date format

```typescript
const model = new FedacoTestUser();
model.setDateFormat('yyyy-MM-dd HH:mm:ss.SSSS');
model.setRawAttributes({
  created_at: '2017-11-14 08:23:19.0000',
  updated_at: '2017-11-14 08:23:19.7348'
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `model.fromDateTime(model.getAttribute('updated_at'))` | exactly match | `'2017-11-14 08:23:19.734800'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### timestamps using default sql server date format

```typescript
const model = new FedacoTestUser();
model.setDateFormat('yyyy-MM-dd HH:mm:ss.SSS');
model.setRawAttributes({
  created_at: '2017-11-14 08:23:19.000',
  updated_at: '2017-11-14 08:23:19.734'
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `model.fromDateTime(model.getAttribute('updated_at'))` | exactly match | `'2017-11-14 08:23:19.734'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### timestamps using old sql server date format

```typescript
const model = new FedacoTestUser();
model.setDateFormat('yyyy-MM-dd HH:mm:ss.000');
model.setRawAttributes({
  created_at: '2017-11-14 08:23:19.000'
});
```


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")
