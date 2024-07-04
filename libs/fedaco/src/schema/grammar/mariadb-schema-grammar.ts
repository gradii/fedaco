import { ColumnDefinition } from '../column-definition';
import { MysqlSchemaGrammar } from './mysql-schema-grammar';


export class MariadbSchemaGrammar extends MysqlSchemaGrammar {
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