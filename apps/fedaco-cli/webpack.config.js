const { composePlugins, withNx } = require('@nx/webpack');
const webpack = require(require.resolve('webpack', {
  paths: [require.resolve('@nx/webpack/package.json')],
}));

const NATIVE_DEPS = [
  'better-sqlite3',
  'sqlite3',
  'mysql2',
  'pg',
  'pg-native',
  'tedious',
  'oracledb',
];

const SHARED_DEPS = [
  '@gradii/fedaco',
];

module.exports = composePlugins(
  withNx({
    target: 'node',
  }),
  (config) => {
    config.output = {
      ...config.output,
      filename: 'fedaco.js',
    };

    const previousExternals = config.externals;
    config.externals = (data, callback) => {
      const request = data && data.request;
      if (typeof request === 'string') {
        for (const dep of NATIVE_DEPS) {
          if (request === dep || request.startsWith(`${dep}/`)) {
            return callback(null, `commonjs ${request}`);
          }
        }
        for (const dep of SHARED_DEPS) {
          if (request === dep || request.startsWith(`${dep}/`)) {
            return callback(null, `commonjs ${request}`);
          }
        }
      }
      if (typeof previousExternals === 'function') {
        return previousExternals(data, callback);
      }
      callback();
    };

    config.optimization = {
      ...(config.optimization || {}),
      minimize: false,
    };

    config.plugins = [
      ...(config.plugins || []),
      new webpack.BannerPlugin({
        banner: '#!/usr/bin/env node',
        raw: true,
        entryOnly: true,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^@nestjs\/(microservices|websockets|platform-express)/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp:
          /^(class-validator|class-transformer|@fastify\/static|@nestjs\/(microservices|websockets|platform-express))$/,
      }),
    ];

    return config;
  }
);
