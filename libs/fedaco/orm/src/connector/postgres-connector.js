import { __awaiter } from 'tslib'

import { Connector } from './connector'
export class PostgresConnector extends Connector {
  constructor() {
    super(...arguments)

    this.options = {}
  }

  connect(config) {
    return __awaiter(this, void 0, void 0, function* () {
      throw new Error('method not implemented.')
    })
  }
}
