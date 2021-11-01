## timestamps using old sql server date format

```typescript
const model = new FedacoTestUser();
model.setDateFormat('yyyy-MM-dd HH:mm:ss.000');
model.setRawAttributes({
      'created_at': '2017-11-14 08:23:19.000'
    });
```