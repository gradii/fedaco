import { Model } from '../src/fedaco/model';


export class EloquentModelStub extends Model {
  public _connection: any;
  public _scopesCalled: any = [];
  protected _table: any = "stub";
  protected _guarded: any = [];
  // protected morph_to_stub_type: any = EloquentModelSaveStub;
  protected _casts: any = {
    "castedFloat": "float"
  };
  public getListItemsAttribute(value) {
    // return json_decode(value, true);
  }
  public setListItemsAttribute(value) {
    // this.attributes["list_items"] = json_encode(value);
  }
  public getPasswordAttribute() {
    return "******";
  }
  public setPasswordAttribute(value) {
    // this.attributes["password_hash"] = sha1(value);
  }
  public publicIncrement(column, amount = 1, extra = []) {
    // return this.increment(column, amount, extra);
  }
  public belongsToStub() {
    // return this.belongsTo(EloquentModelSaveStub);
  }
  public morphToStub() {
    // return this.morphTo();
  }
  public morphToStubWithKeys() {
    // return this.morphTo(null, "type", "id");
  }
  public morphToStubWithName() {
    // return this.morphTo("someName");
  }
  public morphToStubWithNameAndKeys() {
    // return this.morphTo("someName", "type", "id");
  }
  public belongsToExplicitKeyStub() {
    // return this.belongsTo(EloquentModelSaveStub, "foo");
  }
  public incorrectRelationStub() {
    return "foo";
  }
  public getDates() {
    return [];
  }
  public getAppendableAttribute() {
    return "appended";
  }
  public scopePublished(builder) {
    this.scopesCalled.push("published");
  }
  public scopeCategory(builder, category) {
    this.scopesCalled["category"] = category;
  }
  public scopeFramework(builder, framework, version) {
    this.scopesCalled["framework"] = [framework, version];
  }
}