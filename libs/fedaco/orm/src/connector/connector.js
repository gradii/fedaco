export class Connector {
  constructor() {
    this.options = {}
  }

  createConnection(dsn, config, options) {
    var _a, _b
    const [username, password] = [
      (_a = config['username']) !== null && _a !== void 0 ? _a : null,
      (_b = config['password']) !== null && _b !== void 0 ? _b : null,
    ]
    try {
      return this.createPdoConnection(dsn, username, password, options)
    } catch (e) {
      return this.tryAgainIfCausedByLostConnection(
        e,
        dsn,
        username,
        password,
        options
      )
    }
  }

  createPdoConnection(dsn, username, password, options) {}

  isPersistentConnection(options) {}

  tryAgainIfCausedByLostConnection(e, dsn, username, password, options) {}

  getOptions(config) {
    var _a
    const options = (_a = config['options']) !== null && _a !== void 0 ? _a : {}
    return Object.assign(Object.assign({}, this.options), options)
  }

  getDefaultOptions() {
    return this.options
  }

  setDefaultOptions(options) {
    this.options = options
  }
}
