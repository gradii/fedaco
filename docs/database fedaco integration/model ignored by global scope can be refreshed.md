## model ignored by global scope can be refreshed

```typescript
const user = await FedacoTestUserWithOmittingGlobalScope.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
```