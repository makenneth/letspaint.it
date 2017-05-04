var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');

module.exports = {
  devtool: 'eval-source-map',
  context: __dirname,
  entry: path.join(__dirname, 'app', 'index.js'),
  output: {
    path: path.join(__dirname, 'public'),
    publicPath: '/public/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.scss$/,
        loader: 'style-loader!css-loader?-autoprefixer!postcss-loader!sass-loader',
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader?-autoprefixer!postcss-loader',
      },
      { test: /\.json$/, loader: 'json-loader' },
      {
        test: /\.ttf$/,
        loader: 'url',
        query: {
          limit: '10000',
          mimetype: 'application/octet-stream'
        }
      }
    ]
  },
  resolve: {
    modules: ['src', 'node_modules'],
    mainFiles: ['index'],
    extensions: ['', '.js', '.jsx'],
    alias: {
      components: path.resolve(__dirname, 'app/components/'),
      assets: path.resolve(__dirname, 'app/assets/'),
      actions: path.resolve(__dirname, 'app/reduxHandler/actions'),
      actionTypes: path.resolve(__dirname, 'app/reduxHandler/actionTypes'),
      constants: path.resolve(__dirname, 'app/constants'),
      middleware: path.resolve(__dirname, 'app/reduxHandler/middleware'),
      reducers: path.resolve(__dirname, 'app/reduxHandler/reducers'),
      reduxHandler: path.resolve(__dirname, 'app/reduxHandler/'),
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
        'DEVTOOLS': false,
        'WS_URL': JSON.stringify('ws://127.0.0.1/ws')
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.AggressiveMergingPlugin()
  ],
  postcss: [ autoprefixer({ browserslist: ['> 5%', 'last 2 versions'] }) ]
};