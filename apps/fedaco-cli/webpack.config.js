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

// Packages that should be required at runtime from the consumer's node_modules
// rather than bundled into the CLI. @gradii/fedaco is the main library — keeping
// it external avoids duplicating it in the CLI bundle.
const EXTERNAL_PKGS = ['@gradii/fedaco'];

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
        for (const dep of EXTERNAL_PKGS) {
          if (request === dep || request.startsWith(`${dep}/`)) {
            return callback(null, `commonjs ${request}`);
          }
        }
      }
      callback();
    };

    config.optimization = {
      ...(config.optimization || {}),
      minimize: true,
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
    ];

    config.devtool = 'source-map';

    return config;
  }
);
