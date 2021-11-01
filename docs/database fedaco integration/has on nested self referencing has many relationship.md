## has on nested self referencing has many relationship

```typescript
const grandParentPost = await FedacoTestPost.createQuery().create({
      'name'   : 'Grandparent Post',
      'user_id': 1
    });
const parentPost      = await FedacoTestPost.createQuery().create({
      'name'     : 'Parent Post',
      'parent_id': grandParentPost.id,
      'user_id'  : 2
    });
await FedacoTestPost.createQuery().create({
      'name'     : 'Child Post',
      'parent_id': parentPost.id,
      'user_id'  : 3
    });
// @ts-ignore
    const results: FedacoTestPost[] = await FedacoTestPost.createQuery().has(
      'childPosts.childPosts').get();
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
