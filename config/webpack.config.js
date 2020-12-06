const path = require('path');
const nodeExternals = require('webpack-node-externals');

const webpack = require('webpack');
const NodemonPlugin = require('nodemon-webpack-plugin');
const {WebpackManifestPlugin} = require('webpack-manifest-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const resolveSource = (_path) => path.resolve(__dirname, '../src/', _path);

const createConfig = ({
  mode = process.env.NODE_ENV || 'development',
  rules = [],
  entry,
  target = 'web',
  distPath,
  externals,
  plugins = [],
  override,
}) => {
  const devMode = mode === 'development';

  return {
    watch: devMode,
    mode,
    target,
    entry,
    externals,
    node: {
      __dirname: false,
      __filename: false,
    },
    module: {
      rules: [
        ...rules,
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
        ...!devMode ? [] : [
          {
            enforce: 'pre',
            test: /\.tsx?$/,
            exclude: /node_modules/,
            loader: 'eslint-loader',
            options: {
              emitError: true,
            },
          },
        ],
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
        '@client': resolveSource('client/'),
        '@server': resolveSource('server/'),
        '@shared': resolveSource('shared/'),
        '@assets': path.resolve(__dirname, '../assets/'),
      },
    },
    output: {
      filename: distPath,
      path: path.resolve(__dirname, '../dist/'),
      publicPath: '/',
    },
    plugins: [
      ...plugins(
        {
          mode,
        },
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
];
