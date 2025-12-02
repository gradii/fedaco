
import { reflector } from '@gradii/annotation';
import { FedacoColumn } from '../../annotation/column';
import { mixinGuardsAttributes } from './guards-attributes';

jest.mock('@gradii/annotation', () => ({
  reflector: {
    propMetadata: jest.fn(),
  },
}));

jest.mock('../../annotation/column', () => ({
  FedacoColumn: {
    isTypeOf: jest.fn(),
  },
}));

class Base {}

describe('GuardsAttributes Mixin', () => {
  let MixedClass: any;

  beforeEach(() => {
    jest.clearAllMocks();
    MixedClass = mixinGuardsAttributes(Base);
  });

  it('should initialize _defaultMetaFillable from annotations', () => {
    (reflector.propMetadata as jest.Mock).mockReturnValue({
      name: [{ fillable: true }],
      email: [{ fillable: true }],
      password: [{}], // Not fillable
    });

    (FedacoColumn.isTypeOf as jest.Mock).mockImplementation((obj) => !!obj);

    const instance = new MixedClass();

    expect(instance._defaultMetaFillable).toEqual(['name', 'email']);
    expect(instance.GetRealFillable()).toEqual(['name', 'email']);
    expect(instance.IsFillable('name')).toBe(true);
    expect(instance.IsFillable('email')).toBe(true);
    expect(instance.IsFillable('password')).toBe(false);
  });

  it('should allow manual addition of fillable attributes via _fillable', () => {
    (reflector.propMetadata as jest.Mock).mockReturnValue({
      name: [{ fillable: true }],
    });
    (FedacoColumn.isTypeOf as jest.Mock).mockImplementation((obj) => !!obj);

    class Child extends MixedClass {
      constructor() {
        super();
        this.MergeFillable(['manual_field']);
      }
    }

    const instance = new Child();

    expect(instance._defaultMetaFillable).toEqual(['name']);
    expect(instance.GetFillable()).toEqual(['manual_field']);
    expect(instance.GetRealFillable()).toEqual(['name', 'manual_field']);
    
    expect(instance.IsFillable('name')).toBe(true);
    expect(instance.IsFillable('manual_field')).toBe(true);
  });

  it('should allow manual removal of fillable attributes via _unFillable', () => {
    (reflector.propMetadata as jest.Mock).mockReturnValue({
      name: [{ fillable: true }],
      email: [{ fillable: true }],
    });
    (FedacoColumn.isTypeOf as jest.Mock).mockImplementation((obj) => !!obj);

    class Child extends MixedClass {
      constructor() {
        super();
        this.UnFillable(['email']);
      }
    }

    const instance = new Child();

    expect(instance._defaultMetaFillable).toEqual(['name', 'email']);
    expect(instance._unFillable).toEqual(['email']);
    expect(instance.GetRealFillable()).toEqual(['name']);
    
    expect(instance.IsFillable('name')).toBe(true);
    expect(instance.IsFillable('email')).toBe(false);
  });

  it('should prioritize _fillable over _unFillable', () => {
    // If something is in both _unFillable and _fillable, it should be fillable (whitelist wins)
    (reflector.propMetadata as jest.Mock).mockReturnValue({
      name: [{ fillable: true }],
    });
    (FedacoColumn.isTypeOf as jest.Mock).mockImplementation((obj) => !!obj);

    class Child extends MixedClass {
      constructor() {
        super();
        // Remove 'name' from default
        this.MergeUnFillable(['name']);
        // But explicitly add it back
        this.MergeFillable(['name']);
      }
    }

    const instance = new Child();

    expect(instance.IsFillable('name')).toBe(true);
    expect(instance.GetRealFillable()).toEqual(['name']);
  });

  it('should handle subclass property definition correctly', () => {
    (reflector.propMetadata as jest.Mock).mockReturnValue({
      annotation_field: [{ fillable: true }],
    });
    (FedacoColumn.isTypeOf as jest.Mock).mockImplementation((obj) => !!obj);

    class Child extends MixedClass {
      // This defines _fillable on the instance, which is the "manual" list
      _fillable = ['child_field'];
    }

    const instance = new Child();

    // _defaultMetaFillable should still be populated from parent constructor
    expect(instance._defaultMetaFillable).toEqual(['annotation_field']);
    // _fillable should be what the child defined
    expect(instance.GetFillable()).toEqual(['child_field']);
    expect(instance.GetRealFillable()).toEqual(['annotation_field', 'child_field']);
    
    expect(instance.IsFillable('annotation_field')).toBe(true);
    expect(instance.IsFillable('child_field')).toBe(true);
  });
});
