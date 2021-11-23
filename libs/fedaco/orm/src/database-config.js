import { ConnectionFactory } from './connector/connection-factory'
import { DatabaseManager } from './database-manager'
import { NullDispatcher } from './fedaco/mixins/has-events'
import { Model } from './fedaco/model'
export class DatabaseConfig {
  constructor() {
    this.config = {
      database: {
        fetch: 0,
        default: 'default',
        connections: {},
      },
    }

    this.setupManager()
  }

  setupManager() {
    const factory = new ConnectionFactory()
    this.manager = new DatabaseManager(factory)
  }

  static connection(connection = null) {
    return this.instance.getConnection(connection)
  }

  setAsGlobal() {
    this.constructor.instance = this
  }

  static table(table, as = null, connection = null) {
    return this.instance.constructor.connection(connection).table(table, as)
  }

  static schema(connection = null) {
    return this.instance.constructor.connection(connection).getSchemaBuilder()
  }

  getConnection(name = null) {
    return this.manager.connection(name)
  }

  addConnection(config, name = 'default') {
    const connections = this.config.database.connections

    connections[name] = config
    this.config.database.connections = connections
  }

  bootFedaco() {
    Model.setConnectionResolver(this.manager)
    const events = {
      forget(event) {},
      until() {
        return true
      },
      dispatch() {},
    }
    const dispatcher = new NullDispatcher(events)
    if (dispatcher) {
      Model.setEventDispatcher(dispatcher)
    }
  }

  getDatabaseManager() {
    return this.manager
  }
}
