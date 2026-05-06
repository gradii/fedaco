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

module.exports = composePlugins(
  withNx({
    target: 'node',
  }),
  (config) => {
    config.externals = (data, callback) => {
      const request = data && data.request;
      if (typeof request === 'string') {
        for (const dep of NATIVE_DEPS) {
          if (request === dep || request.startsWith(`${dep}/`)) {
            return callback(null, `commonjs ${request}`);
          }
        }
      }
      callback();
    };

    config.optimization = {
      ...(config.optimization || {}),
      minimize: false,
      splitChunks: false,
      runtimeChunk: false,
    };

    config.output = {
      ...(config.output || {}),
      asyncChunks: false,
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
      new webpack.IgnorePlugin({
        resourceRegExp: /^prettier$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^@fig\/complete-commander$/,
      }),
    ];

    config.devtool = 'source-map';

    return config;
  }
);
