import { Connector } from './connector'
export class PostgresConnector extends Connector {
  constructor() {
    super(...arguments)

    this.options = {}
  }

  connect(config) {}
}
