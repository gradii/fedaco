import { __awaiter } from 'tslib'

import { Connector } from './connector'
export class SqlServerConnector extends Connector {
  constructor() {
    super(...arguments)

    this.options = {}
  }

  connect(config) {
    return __awaiter(this, void 0, void 0, function* () {
      const options = this.getOptions(config)
      return this.createConnection(this.getDsn(config), config, options)
    })
  }

  getDsn(config) {
    return `${config.host}`
  }
}
