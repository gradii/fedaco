import { reflector } from '@gradii/annotation';
import { isFunction } from '@gradii/check-type';
import { findLast } from 'ramda';
import { ColumnAnnotation, FedacoColumn } from '../src/annotation/column';
import { FedacoRelationColumn, RelationColumnAnnotation } from '../src/annotation/relation-column';
import { DatabaseConfig } from '../src/database-config';
import { Model } from '../src/fedaco/model';
import { HasMany } from '../src/fedaco/relations/has-many';
import { SchemaBuilder } from '../src/schema/schema-builder';
import { BasicModel, } from './model/basic.model';
import { FedacoBuilderTestModelParentStub } from './model/fedaco-builder-test-model-parent-stub';
import { ArticleModel, HasManyRelationModel, MemberModel } from './model/has-many-relation.model';
import { HasOneRelationModel } from './model/has-one-relation.model';
import { RelationModel } from './model/relation.model';


function _columnInfo(typeOfClazz: any, key: string) {
  const meta = reflector.propMetadata(typeOfClazz);
  return findLast(it => {
    return FedacoRelationColumn.isTypeOf(it);
  }, meta[key]) as ColumnAnnotation;
}

function connection(connectionName = 'default') {
  return Model.getConnectionResolver().connection(connectionName);
}

function schema(connectionName = 'default'): SchemaBuilder {
  return connection(connectionName).getSchemaBuilder();
}

describe('model annotation', () => {
  async function createSchema() {
    await schema('default')
      .create('article_models', table => {
        table.increments('id');
        table.string('member_model_id');
        table.timestamps();
      });
  }

  beforeAll(async () => {
    const db = new DatabaseConfig();
    db.addConnection({
      'driver': 'sqlite',
      // 'database': files.default
      'database': ':memory:'
    });
    db.bootFedaco();
    db.setAsGlobal();
    await createSchema();
  });

  it('instance model', () => {
    const m = new BasicModel();

    expect(m).toBeInstanceOf(Model);
  });

  it('test basic', () => {
    const basic = new BasicModel();

    const metadata = reflector.propMetadata(BasicModel);

    expect(metadata['name'].length).toBe(1);
    expect(metadata['name'][0].field).toBe('name');
  });

  it('test basic model', () => {
    const basic = new BasicModel();
    basic.name  = 'hello';

    const meta = reflector.propMetadata(BasicModel);
    const a    = findLast(it => FedacoColumn.isTypeOf(it), meta['name']);
  });

  it('test relation annoation', () => {
    const relationModel = new RelationModel();

    const meta = reflector.propMetadata(RelationModel);

    expect(meta).toMatchSnapshot('meta');
  });

  it('test relation annotation get should call getAttribute', () => {
    const relationModel = new RelationModel();

    const meta = reflector.propMetadata(RelationModel);

    const spy1 = jest.spyOn(relationModel, 'getAttribute').mockReturnValue('foo');
    const data = relationModel.columnFoo;

    expect(spy1).toBeCalled();
    expect(data).toBe('foo');
  });

  it('test relation annotation get belongs to many', () => {
    const relationModel = new FedacoBuilderTestModelParentStub();

    const meta = reflector.propMetadata(FedacoBuilderTestModelParentStub);

    const data = relationModel.roles;
  });

  it('test relation annotation set relation should throw exception', () => {
    const relationModel = new RelationModel();

    expect(() => {
      relationModel.columnFoo = 'foo';
    }).toThrow('the relation field is readonly');
  });

  it('test annotation hasOne', () => {
    const relationModel = new HasOneRelationModel();

    const meta = reflector.propMetadata(HasOneRelationModel);
    expect(meta).toMatchSnapshot('has one');


  });

  it('test annotation hasMany', () => {
    const relationModel = new HasManyRelationModel();

    const meta = reflector.propMetadata(HasManyRelationModel);
    expect(meta).toMatchSnapshot('has many');

  });

  it('test annotation get hasMany relation', () => {
    const relationModel = new MemberModel();

    const meta = reflector.propMetadata(MemberModel);
    expect(meta).toMatchSnapshot('has many');


    const metaColumnInfo: RelationColumnAnnotation = _columnInfo(MemberModel, 'articles');

    expect(metaColumnInfo).toMatchObject({
      isRelation: true,
      type      : 'HasMany'
    });

    expect(isFunction(metaColumnInfo._getRelation)).toBe(true);

    const hasMany = metaColumnInfo._getRelation(relationModel, 'articles');

    expect(hasMany).toBeInstanceOf(HasMany);
  });

  xit('test annotation get hasMany relation sql', async () => {
    const memberModel = new MemberModel();

    memberModel.id = 101;

    const metaColumnInfo: RelationColumnAnnotation = _columnInfo(MemberModel, 'articles');

    // const spy1 = jest.spyOn(memberModel._connection, 'query');

    const hasMany = metaColumnInfo._getRelation(memberModel, 'articles');

    expect(hasMany).toBeInstanceOf(HasMany);

    const results = await hasMany.getResults();

    expect(results[0] instanceof ArticleModel).toBe(true);

    // tmp test
    expect(results[0]._attributes['sql']).toBe(
      'SELECT * FROM `article_models` WHERE `article_models`.`member_model_id` = ? AND `article_models`.`member_model_id` IS NOT NULL');
    expect(results[0]._attributes['bindings']).toEqual([101]);
  });

  xit('test annotation use direct field access', async () => {
    const memberModel = new MemberModel();

    memberModel.id = 101;

    const results = await memberModel.articles;

    expect(results[0] instanceof ArticleModel).toBe(true);

    // todo fixme tmp test hack code in hasRelationship
    expect(results[0]._attributes['sql']).toBe(
      'SELECT * FROM `article_models` WHERE `article_models`.`member_model_id` = ? AND `article_models`.`member_model_id` IS NOT NULL');
    expect(results[0]._attributes['bindings']).toEqual([101]);
  });

  // it('test annotation ')

});
