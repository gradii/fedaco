## basic morph many relationship

```typescript
const user = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
await user.newRelation('photos').create({
      'name': 'Avatar 1'
    });
await user.newRelation('photos').create({
      'name': 'Avatar 2'
    });
const post = await user.newRelation('posts').create({
      'name': 'First Post'
    });
await post.newRelation('photos').create({
      'name': 'Hero 1'
    });
await post.newRelation('photos').create({
      'name': 'Hero 2'
    });
const userPhotos = await user.photos;
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
