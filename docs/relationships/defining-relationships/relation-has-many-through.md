# Has Many Through

The "has-many-through" relationship provides a convenient way to access distant relations via an intermediate relation. For example, let's assume we are building a deployment platform. A `Project` model might access many `Deployment` models through an intermediate `Environment` model. Using this example, you could easily gather all deployments for a given project. Let's look at the tables required to define this relationship:

    projects
        id - integer
        name - string

    environments
        id - integer
        project_id - integer
        name - string

    deployments
        id - integer
        environment_id - integer
        commit_hash - string

Now that we have examined the table structure for the relationship, let's define the relationship on the `Project` model:

```typescript
class Project extends Model {
  /**
   * Get all of the deployments for the project.
   */
  @HasManyThroughColumn({
    related: forwardRef(() => Deployment),
    through: forwardRef(() => Environment)
  })
  public deployments: FedacoRelationType<Deployment[]>;
}
```

The `related` argument passed to the `HasManyThroughColumn` annotation is the name of the final model we wish to access, while the `through` argument is the name of the intermediate model.

#### Key Conventions

Typical Fedaco foreign key conventions will be used when performing the relationship's queries. If you would like to customize the keys of the relationship, you may pass them as the `firstKey` and `secondKey` config to the `hasManyThrough` method. The `firstKey` argument is the name of the foreign key on the intermediate model. The `secondKey` argument is the name of the foreign key on the final model. The `localKey` argument is the local key, while the `secondLocalKey` argument is the local key of the intermediate model:

```typescript
class Project extends Model {
  @HasManyThroughColumn({
    related: Deployment,
    through: Environment,
    firstKey: 'project_id',
    secondKey: 'environment_id',
    localKey: 'id',
    secondLocalKey: 'id'
  })
  public deployments: FedacoRelationType<Deployment[]>;
}
```
