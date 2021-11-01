## isset loads in relationship if it isnt loaded already

```typescript
const user = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
await user.newRelation('post').create({
      'name': 'First Post'
    });
```