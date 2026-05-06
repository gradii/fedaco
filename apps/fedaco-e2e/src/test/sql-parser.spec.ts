import { type Identifier, SqlParser } from '@gradii/fedaco';

describe('fedaco sql parse ', () => {
  it('test parse sql string', () => {
    const first = 'order.smartTradeId';
    const result = SqlParser.createSqlParser(first).parseUnaryTableColumn();

    expect(result).not.toBeNull();
    expect((result.tableIdentifier as Identifier).name).toBe('order');
    expect((result.columnIdentifier as Identifier).name).toBe('smartTradeId');
  });
});
