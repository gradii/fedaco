/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { ConnectorInterface } from './connector-interface';
import type { WrappedConnection } from './wrapped-connection';

/**
 * Establish a {@link WrappedConnection}, handling cluster vs single-host
 * configs. Drivers implementing {@link DatabaseDriver.createConnector} should
 * delegate to this helper so the host-fallback policy stays consistent
 * across drivers.
 *
 * - **Cluster** (`config.host` is an array): shuffle the hosts and try each
 *   one in turn, returning the first successful connection. Mirrors what
 *   `ConnectionFactory.createPdoResolverWithHosts` used to do.
 * - **Single host** (`config.host` is a string, or no `host` field at all):
 *   connect directly without any retry logic, like
 *   `createPdoResolverWithoutHosts`.
 */
export async function connectWithHosts(
  config: any,
  connector: ConnectorInterface,
): Promise<WrappedConnection> {
  if (Array.isArray(config['host'])) {
    const hosts = [...config['host']].sort(() => 0.5 - Math.random());
    if (!hosts.length) {
      throw new Error('InvalidArgumentException Database hosts array is empty.');
    }
    let lastError: unknown;
    for (const host of hosts) {
      config['host'] = host;
      try {
        return await connector.connect(config);
      } catch (e) {
        lastError = e;
        continue;
      }
    }
    throw new Error(`connect fail: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
  }
  return await connector.connect(config);
}
