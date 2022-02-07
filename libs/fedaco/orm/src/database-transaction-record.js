import { __awaiter } from 'tslib'
export class DatabaseTransactionRecord {
  constructor(connection, level) {
    this.callbacks = []
    this.connection = connection
    this.level = level
  }

  addCallback(callback) {
    this.callbacks.push(callback)
  }

  executeCallbacks() {
    return __awaiter(this, void 0, void 0, function* () {
      for (const callback of this.callbacks) {
        yield callback()
      }
    })
  }

  getCallbacks() {
    return this.callbacks
  }
}
