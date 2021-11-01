## where has on self referencing has many relationship

```typescript
const parentPost = await FedacoTestPost.createQuery().create({
      'name'   : 'Parent Post',
      'user_id': 1
    });
await FedacoTestPost.createQuery().create({
      'name'     : 'Child Post',
      'parent_id': parentPost.id,
      'user_id'  : 2
    });
// @ts-ignore
    const results: FedacoTestPost[] = await FedacoTestPost.createQuery().whereHas('childPosts',
      query => {
        query.where('name', 'Child Post');
      }).get();
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
