## basic morph many relationship

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
see also [prerequisites](./prerequisite.md)
