const path = require('path');
const nodeExternals = require('webpack-node-externals');
const {WebpackManifestPlugin} = require('webpack-manifest-plugin');
const webpack = require('webpack');
const NodemonPlugin = require('nodemon-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const SentryPlugin = require('@sentry/webpack-plugin');

/* eslint-disable import/no-default-export */
require('dotenv').config(
  {
    path: '../env',
  },
);

const {
  NODE_ENV,
  SENTRY_ORG,
  SENTRY_PROJECT,
  SENTRY_AUTH_TOKEN,
} = process.env;

const resolveSource = (_path) => path.resolve(__dirname, '../src/', _path);

const createConfig = ({
  mode = NODE_ENV || 'development',
  rules = [],
  entry,
  target = 'web',
  distPath,
  externals,
  plugins = () => [],
  override,
}) => {
  const devMode = mode !== 'production';
  const outputPath = path.resolve(__dirname, '../dist/');

  return {
    watch: devMode,
    mode,
    target,
    entry,
    externals,
    devtool: devMode ? 'eval' : 'source-map',
    node: {
      __dirname: false,
      __filename: false,
    },
    module: {
      rules: [
        ...rules,
        {
          test: /\.(jade|pug)$/i,
          use: 'raw-loader',
        },
        {
          test: /\.(png|jpe?g|gif|ttf|svg)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                outputPath: 'public',
                publicPath: '/public',
                emitFile: target === 'web',
              },
            },
          ],
        },
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            onlyCompileBundledFiles: true,
            configFile: path.resolve(__dirname, '../tsconfig.json'),
          },
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@api': resolveSource('api/'),
        '@client': resolveSource('client/'),
        '@server': resolveSource('server/'),
        '@shared': resolveSource('shared/'),
        '@tasks': resolveSource('tasks/'),
        '@scrapper': resolveSource('server/modules/importer/modules/scrapper'),
        '@spider': resolveSource('server/modules/importer/modules/spider'),
        '@db-loader': resolveSource('server/modules/importer/modules/db-loader'),
        '@importer': resolveSource('server/modules/importer'),
        '@sites': resolveSource('server/modules/importer/sites'),
        '@assets': path.resolve(__dirname, '../assets/'),
      },
    },
    output: {
      filename: distPath,
      path: outputPath,
      publicPath: '/',
    },
    plugins: [
      ...plugins(
        {
          mode,
        },
      ),
      ...(
        !devMode
          ? [
            new SentryPlugin(
              {
                authToken: SENTRY_AUTH_TOKEN,
                org: SENTRY_ORG,
                project: SENTRY_PROJECT,
                include: outputPath,
              },
            ),
          ]
          : [
            new ESLintPlugin(
              {
                extensions: ['ts', 'tsx', 'js'],
                failOnError: false,
                emitError: true,
                cache: true,
              },
            ),
          ]
      ),
      new webpack.optimize.LimitChunkCountPlugin(
        {
          maxChunks: 5,
        },
      ),
    ],
    ...override,
  };
};

module.exports = [
  // client
  createConfig(
    {
      entry: {
        client: resolveSource('client/client.tsx'),
      },
      distPath: 'public/[name]-[contenthash].js',
      plugins: () => [
        new webpack.EnvironmentPlugin(
          [
            'NODE_ENV',
            'APP_ENV',
          ],
        ),
        new WebpackManifestPlugin(
          {
            fileName: 'public/files-manifest.json',
          },
        ),
        new MiniCssExtractPlugin(
          {
            filename: 'public/[name]-[contenthash].css',
            chunkFilename: '[id].css',
          },
        ),
      ],
      rules: [
        {
          test: /\.(scss|css)$/i,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
          ],
        },
      ],
    },
  ),

  // server
  createConfig(
    {
      target: 'node',
      entry: {
        server: resolveSource('server/server.ts'),
      },
      distPath: 'server.js',
      plugins: ({mode}) => [
        ...mode !== 'production'
          ? [new NodemonPlugin(
            {
              watch: [
                path.resolve('./src'),
                path.resolve('./assets'),
                path.resolve('./dist'),
              ],
            },
          )]
          : [],
        new CopyPlugin(
          {
            patterns: [
              {
                from: path.resolve(__dirname, '../public'),
                to: path.resolve(__dirname, '../dist/public/no-prefix'),
              },
            ],
          },
        ),
      ],
      externals: [
        nodeExternals(),
      ],
      override: {
        optimization: {
          minimize: false,
        },
      },
    },
  ),

  // gulp
  createConfig(
    {
      target: 'node',
      entry: {
        server: resolveSource('tasks/gulpfile.ts'),
      },
      distPath: 'gulpfile.js',
      externals: [
        nodeExternals(),
      ],
      override: {
        optimization: {
          minimize: false,
        },
      },
    },
  ),

  // console
  createConfig(
    {
      target: 'node',
      entry: {
        server: resolveSource('console.ts'),
      },
      distPath: 'console.js',
      externals: [
        nodeExternals(),
      ],
      override: {
        optimization: {
          minimize: false,
        },
      },
    },
  ),
];
