# Function Has
### has on morph to relationship

```typescript
await expect(async () => {
  await FedacoTestUser.createQuery().has('imageable').get();
}).rejects.toThrowError(
  `the relation [imageable] can't acquired. try to define a relation like\n@HasManyColumn()\npublic readonly imageable;\n`
);
```


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### has on nested self referencing belongs to many relationship with where pivot

```typescript
const user = await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
const friend = await user.NewRelation('friends').create({
  id: 2,
  email: 'xsilen@gradii.com'
});
await friend.NewRelation('friends').create({
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
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### has on nested self referencing belongs to many relationship

```typescript
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
const friend = await user.NewRelation('friends').create({
  email: 'xsilen@gradii.com'
});
await friend.NewRelation('friends').create({
  email: 'foo@gmail.com'
});
const results = await FedacoTestUser.createQuery().has('friends.friends').get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### has on nested self referencing belongs to relationship

```typescript
const grandParentPost = await FedacoTestPost.createQuery().create({
  name: 'Grandparent Post',
  user_id: 1
});
const parentPost = await FedacoTestPost.createQuery().create({
  name: 'Parent Post',
  parent_id: grandParentPost.id,
  user_id: 2
});
await FedacoTestPost.createQuery().create({
  name: 'Child Post',
  parent_id: parentPost.id,
  user_id: 3
});
const results: FedacoTestPost[] = await FedacoTestPost.createQuery()
  .has('parentPost.parentPost')
  .get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).name` | exactly match | `'Child Post'` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### has on nested self referencing has many relationship

```typescript
const grandParentPost = await FedacoTestPost.createQuery().create({
  name: 'Grandparent Post',
  user_id: 1
});
const parentPost = await FedacoTestPost.createQuery().create({
  name: 'Parent Post',
  parent_id: grandParentPost.id,
  user_id: 2
});
await FedacoTestPost.createQuery().create({
  name: 'Child Post',
  parent_id: parentPost.id,
  user_id: 3
});
const results: FedacoTestPost[] = await FedacoTestPost.createQuery()
  .has('childPosts.childPosts')
  .get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).name` | exactly match | `'Grandparent Post'` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### has on self referencing belongs to many relationship with where pivot

```typescript
const user = await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await user.NewRelation('friends').create({
  id: 2,
  email: 'xsilen@gradii.com'
});
const results = await FedacoTestUser.createQuery().has('friendsOne').get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### has on self referencing belongs to many relationship

```typescript
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
await user.NewRelation('friends').create({
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
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### has on self referencing belongs to relationship

```typescript
const parentPost = await FedacoTestPost.createQuery().create({
  name: 'Parent Post',
  user_id: 1
});
await FedacoTestPost.createQuery().create({
  name: 'Child Post',
  parent_id: parentPost.id,
  user_id: 2
});
const results = await FedacoTestPost.createQuery().has('parentPost').get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).name` | exactly match | `'Child Post'` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### has on self referencing has many relationship

```typescript
const parentPost = await FedacoTestPost.createQuery().create({
  name: 'Parent Post',
  user_id: 1
});
await FedacoTestPost.createQuery().create({
  name: 'Child Post',
  parent_id: parentPost.id,
  user_id: 2
});
const results: FedacoTestPost[] = await FedacoTestPost.createQuery()
  .has('childPosts')
  .get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).name` | exactly match | `'Parent Post'` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### has with non where bindings

```typescript
const user = await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await (
  await user.NewRelation('posts').create({
    name: 'Post 2'
  })
)
  .NewRelation('photos')
  .create({
    name: 'photo.jpg'
  });
const query = await FedacoTestUser.createQuery().has('postWithPhotos');
const { result: sql, bindings } = query.toSql();
const bindingsCount = bindings.length;
const questionMarksCount = sql.match(/\?/g)?.length || 0;
```


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)
