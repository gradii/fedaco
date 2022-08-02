import { FedacoRelationListType } from './../../src/fedaco/fedaco-types';
import { MorphToManyColumn } from '../../src/annotation/relation-column/morph-to-many.relation-column';
import { MorphedByManyColumn } from '../../src/annotation/relation-column/morphed-by-many.relation-column';
import { DatabaseConfig } from '../../src/database-config';
import { Model } from '../../src/fedaco/model';
import { forwardRef } from '../../src/query-builder/forward-ref';
import { SchemaBuilder } from '../../src/schema/schema-builder';
import { head } from 'ramda';
import { tap } from 'rxjs/operators';
import { PrimaryColumn } from '../../src/annotation/column/primary.column';

function connection(connectionName = 'default') {
  return Model.getConnectionResolver().connection(connectionName);
}

function schema(connectionName = 'default'): SchemaBuilder {
  return connection(connectionName).getSchemaBuilder();
}

jest.setTimeout(100000);

async function createSchema() {
  await schema('default').create('posts', table => {
    table.increments('id');
    table.timestamps();
  });
  await schema('default').create('images', table => {
    table.increments('id');
    table.timestamps();
  });
  await schema('default').create('tags', table => {
    table.increments('id');
    table.timestamps();
  });
  await schema('default').create('taggables', table => {
    table.integer('fedaco_many_to_many_polymorphic_test_tag_id');
    table.integer('taggable_id');
    table.string('taggable_type');
  });
}

describe('test database fedaco polymorphic relations integration', () => {
  beforeEach(async () => {
    const db = new DatabaseConfig();
    db.addConnection({
      'driver'  : 'sqlite',
      'database': ':memory:'
    });
    db.bootFedaco();
    db.setAsGlobal();
    await createSchema();
  });

  it('creation', async () => {
    const post  = await EloquentManyToManyPolymorphicTestPost.createQuery().create();
    const image = await EloquentManyToManyPolymorphicTestImage.createQuery().create();
    const tag   = await EloquentManyToManyPolymorphicTestTag.createQuery().create();
    const tag2  = await EloquentManyToManyPolymorphicTestTag.createQuery().create();
    await post.newRelation('tags').attach(tag.id);
    await post.newRelation('tags').attach(tag2.id);
    await image.newRelation('tags').attach(tag.id);
    
    expect(await post.tags).toHaveLength(2);
    expect(await image.tags).toHaveLength(1);
    expect(await tag.posts).toHaveLength(1);
    expect(await tag.images).toHaveLength(1);
    expect(await tag2.posts).toHaveLength(1);
    expect(await tag2.images).toHaveLength(0);
  });

  it('eager loading', async () => {
    let post = await EloquentManyToManyPolymorphicTestPost.createQuery().create();
    let tag  = await EloquentManyToManyPolymorphicTestTag.createQuery().create();
    post.newRelation('tags').attach(tag.id);
    post = await EloquentManyToManyPolymorphicTestPost.createQuery().with('tags')
      .where('id', 1).first();
    tag  = await EloquentManyToManyPolymorphicTestTag.createQuery().with('posts')
      .where('id', 1).first();
    expect(post.relationLoaded('tags')).toBeTruthy();
    expect(tag.relationLoaded('posts')).toBeTruthy();
    expect(head(post.tags as Model[]).id).toEqual(tag.id);
    expect(head(tag.posts as Model[]).id).toEqual(post.id);
  });

  it('chunk by id', async () => {
    const post = await EloquentManyToManyPolymorphicTestPost.createQuery().create();
    const tag1 = await EloquentManyToManyPolymorphicTestTag.createQuery().create();
    const tag2 = await EloquentManyToManyPolymorphicTestTag.createQuery().create();
    const tag3 = await EloquentManyToManyPolymorphicTestTag.createQuery().create();
    post.newRelation('tags').attach([tag1.id, tag2.id, tag3.id]);
    let count      = 0;
    let iterations = 0;
    await post.newRelation('tags').chunkById(2).pipe(
      tap(({results: tags})=>{
          expect(head(tags)).toBeInstanceOf(EloquentManyToManyPolymorphicTestTag);
          count += tags.length;
          iterations++;
      })
    ).toPromise();
    expect(iterations).toEqual(2);
    expect(count).toEqual(3);
  });
});

/*Eloquent Models...*/
export class EloquentManyToManyPolymorphicTestPost extends Model {
  _table: any   = 'posts';
  _guarded: any = [];

  @PrimaryColumn()
  id: number;

  @MorphToManyColumn({
    related: forwardRef(() => EloquentManyToManyPolymorphicTestTag),
    name   : 'taggable',
    relatedPivotKey: 'fedaco_many_to_many_polymorphic_test_tag_id'
  })
  public tags: FedacoRelationListType<EloquentManyToManyPolymorphicTestTag>;
}

export class EloquentManyToManyPolymorphicTestImage extends Model {
  _table: any   = 'images';
  _guarded: any = [];

  @PrimaryColumn()
  id: number;

  @MorphToManyColumn({
    related: forwardRef(() => EloquentManyToManyPolymorphicTestTag),
    name   : 'taggable',
    relatedPivotKey: 'fedaco_many_to_many_polymorphic_test_tag_id'
  })
  public tags: FedacoRelationListType<EloquentManyToManyPolymorphicTestTag>;
}

export class EloquentManyToManyPolymorphicTestTag extends Model {
  _table: any   = 'tags';
  _guarded: any = [];

  @PrimaryColumn()
  id: number;

  @MorphedByManyColumn({
    related: EloquentManyToManyPolymorphicTestPost,
    name   : 'taggable',
    foreignPivotKey: 'fedaco_many_to_many_polymorphic_test_tag_id'
  })
  public posts: FedacoRelationListType<EloquentManyToManyPolymorphicTestPost>;

  @MorphedByManyColumn({
    related: EloquentManyToManyPolymorphicTestImage,
    name   : 'taggable',
    foreignPivotKey: 'fedaco_many_to_many_polymorphic_test_tag_id'
  })
  public images: FedacoRelationListType<EloquentManyToManyPolymorphicTestImage>;
}
