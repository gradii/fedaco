# Has One Of Many


It is possible to construct more advanced "has one of many" relationships. For example, a `Product` model may have many associated `Price` models that are retained in the system even after new pricing is published. In addition, new pricing data for the product may be able to be published in advance to take effect at a future date via a `published_at` column.

So, in summary, we need to retrieve the latest published pricing where the published date is not in the future. In addition, if two prices have the same published date, we will prefer the price with the greatest ID. To accomplish this, we must pass an array to the `ofMany` method that contains the sortable columns which determine the latest price. In addition, a closure will be provided as the second argument to the `ofMany` method. This closure will be responsible for adding additional publish date constraints to the relationship query:

```typescript
class Product extends Model {
  /**
   * Get the current pricing for the product.
   */
  @HasOneOfManyColumn({
    related: forwardRef(() => Price),
    column: {
      published_at: 'max',
      id: 'max'
    },
    aggregate: (q) => {
      q.where('published_at', '<', new Date)
    }
  })
  public currentPricing;
}
```

::: code-group

```typescript [run code]
  await (await Product.createQuery().first()).currentPricing
```

```log [sql log]

```