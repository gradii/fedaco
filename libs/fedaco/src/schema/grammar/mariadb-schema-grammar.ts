/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { MysqlConnection } from '../../connection/mysql-connection';
import type { Connection } from '../../connection';
import versionCompare from '../../helper/version-compare';
import type { Blueprint } from '../blueprint';
import type { ColumnDefinition } from '../column-definition';
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

    if (![
      'point', 'linestring', 'polygon', 'geometrycollection', 'multipoint', 'multilinestring', 'multipolygon'
    ].includes(subtype)) {
      subtype = null;
    }

    return `${
      subtype ?? 'geometry'
    }${
      column.srid ? ' ref_system_id=' + column.srid : ''
    }`;
  }
}