import { Connector } from './connector';

export class SqlServerConnector extends Connector {
  constructor() {
    super(...arguments);

    this.options = {};


  }

  connect(config) {
    const options = this.getOptions(config);
    return this.createConnection(this.getDsn(config), config, options);
  }

  getDsn(config) {
    return `${config.host}`;


  }
}
