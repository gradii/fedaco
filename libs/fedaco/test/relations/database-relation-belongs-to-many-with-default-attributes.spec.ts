import { Model } from '../../src/fedaco/model';
import { BelongsToMany } from '../../src/fedaco/relations/belongs-to-many';
import { getBuilder } from './relation-testing-helper';

function getRelationArguments() {
  const parent = new Model();
  jest.spyOn(parent, 'GetKey').mockReturnValue(1);
  jest.spyOn(parent, 'GetCreatedAtColumn').mockReturnValue('created_at');
  jest.spyOn(parent, 'GetUpdatedAtColumn').mockReturnValue('updated_at');
  jest.spyOn(parent, 'GetAttribute').mockReturnValue(1);

  const builder = getBuilder();
  const related = new Model();

  jest.spyOn(builder, 'getModel').mockReturnValue(related);
  jest.spyOn(related, 'GetTable').mockReturnValue('users');
  jest.spyOn(related, 'GetKeyName').mockReturnValue('id');
  return [builder, parent, 'club_user', 'club_id', 'user_id', 'id', 'id', null, false];
}

describe('test database fedaco belongs to many with default attributes', () => {

  it('with pivot value method sets where conditions for fetching', () => {
    const args     = getRelationArguments();
    const relation = new BelongsToMany(
      // @ts-ignore
      args[0], args[1], args[2],
      args[3], args[4], args[5],
      args[6], args[7]
    );
    relation.withPivotValue({
      'is_admin': 1
    });
  });

  it('with pivot value method sets default arguments for insertion', async () => {
    const args     = getRelationArguments();
    const relation = new BelongsToMany(
      // @ts-ignore
      args[0], args[1], args[2],
      args[3], args[4], args[5],
      args[6], args[7]
    );
    relation.withPivotValue({
      'is_admin': 1
    });
    const query     = {
      from(): any {
      },
      insert(): any {
      },

    };
    const mockQuery = {
      newQuery(): any {
      }
    };
    const spy1      = jest.spyOn(query, 'from').mockReturnValue(query);
    const spy11     = jest.spyOn(query, 'insert');
    // @ts-ignore
    const spy2      = jest.spyOn(relation.getQuery(), 'getQuery').mockReturnValue(mockQuery);
    const spy3      = jest.spyOn(mockQuery, 'newQuery').mockReturnValue(query);
    jest.spyOn(query, 'insert').mockReturnValue(true);
    jest.spyOn(relation, 'touchIfTouching').mockReturnValue(Promise.resolve());

    await relation.attach(1);

    expect(spy11).toBeCalledWith([
      {
        'club_id' : 1,
        'user_id' : 1,
        'is_admin': 1
      }
    ]);
    expect(spy3).toBeCalled();
  });

});
