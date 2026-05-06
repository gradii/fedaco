/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  type Blueprint,
  type ColumnDefinition,
  type Connection,
  versionCompare,
} from '@gradii/fedaco';
import type { MysqlConnection } from '../connection/mysql-connection';
import { MysqlSchemaGrammar } from './mysql-schema-grammar';

export class MariadbSchemaGrammar extends MysqlSchemaGrammar {
  public async compileRenameColumn(blueprint: Blueprint, command: ColumnDefinition, connection: Connection) {
    if (versionCompare(await (connection as MysqlConnection).getServerVersion(), '10.5.2') === -1) {
      return this.compileLegacyRenameColumn(blueprint, command, connection);
    }

    return super.compileRenameColumn(blueprint, command, connection);
  }

  protected typeUuid(column: ColumnDefinition) {
    return 'uuid';
  }

  public typeGeometry(column: ColumnDefinition) {
    let subtype = column.subtype ? column.subtype.toLowerCase() : null;

    if (
      ![
        'point',
        'linestring',
        'polygon',
        'geometrycollection',
        'multipoint',
        'multilinestring',
        'multipolygon',
      ].includes(subtype)
    ) {
      subtype = null;
    }

    return `${subtype ?? 'geometry'}${column.srid ? ' ref_system_id=' + column.srid : ''}`;
  }
}
