## paginated model collection retrieval when no elements and default per page

```typescript
const models = await new FedacoTestUser().newQuery().oldest('id').paginate();
```