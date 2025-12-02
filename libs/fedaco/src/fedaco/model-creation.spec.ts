
import { Column } from '../annotation/column/column';
import { Model } from './model';

// Mocking the Model's dependencies if necessary, but trying to use real Model logic
// We need to ensure the decorators work. 
// Since we are in a test environment, we might need to mock the database connection part 
// because Model.Fill might trigger something or Model constructor might.
// Model constructor calls BootIfNotBooted -> Boot.

class TestModelAnnotationOnly extends Model {
  @Column({ fillable: true })
  name: string;

  @Column() // default fillable is true in Column implementation? Let's check. 
            // In column.ts: (p: ColumnAnnotation = {}): ColumnAnnotation => ({fillable: true,...p})
            // So @Column() implies fillable: true.
  email: string;

  @Column({ fillable: false })
  is_admin: boolean;
}

class TestModelManualConstructor extends Model {
  @Column({ fillable: true })
  name: string;

  constructor() {
    super();
    this.MergeFillable(['manual_field']);
  }
}

class TestModelSubclassProperty extends Model {
  @Column({ fillable: true })
  name: string;

  _fillable = ['subclass_field'];
}

describe('Model Creation and Fillable', () => {
  
  it('should fill attributes based on annotations', () => {
    const model = new TestModelAnnotationOnly();
    model.Fill({
      name: 'John',
      email: 'john@example.com',
      is_admin: true,
      other: 'ignored'
    });

    expect(model['name']).toBe('John');
    expect(model['email']).toBe('john@example.com');
    expect(model['is_admin']).toBeUndefined();
    expect(model['other']).toBeUndefined();
  });

  it('should merge manual fillable attributes defined in constructor', () => {
    const model = new TestModelManualConstructor();
    model.Fill({
      name: 'John',
      manual_field: 'manual',
      other: 'ignored'
    });

    expect(model['name']).toBe('John');
    expect(model.GetAttribute('manual_field')).toBe('manual');
    expect(model['other']).toBeUndefined();
  });

  it('should merge subclass _fillable property with annotations', () => {
    const model = new TestModelSubclassProperty();
    model.Fill({
      name: 'John',
      subclass_field: 'sub',
      other: 'ignored'
    });

    expect(model['name']).toBe('John');
    expect(model.GetAttribute('subclass_field')).toBe('sub');
    expect(model['other']).toBeUndefined();
  });

  it('should respect UnFillable', () => {
    class TestModelUnFillable extends Model {
      @Column({ fillable: true })
      name: string;

      constructor() {
        super();
        this.UnFillable(['name']);
      }
    }

    const model = new TestModelUnFillable();
    model.Fill({
      name: 'John'
    });

    expect(model['name']).toBeUndefined();
  });
});
