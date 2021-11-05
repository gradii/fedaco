# Function Morph Map
### morph map is merged by default

```typescript
const map1 = {
  user: FedacoTestUser
};
const map2 = {
  post: FedacoTestPost
};
Relation.morphMap(map1);
Relation.morphMap(map2);
```


----
see also [prerequisites](./../database fedaco integration/prerequisite.md)

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
see also [prerequisites](./../database fedaco integration/prerequisite.md)

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
see also [prerequisites](./../database fedaco integration/prerequisite.md)

### morph map overwrites current map

```typescript
const map1 = {
  user: FedacoTestUser
};
const map2 = {
  post: FedacoTestPost
};
Relation.morphMap(map1, false);
```
```typescript
Relation.morphMap(map2, false);
```


----
see also [prerequisites](./../database fedaco integration/prerequisite.md)
