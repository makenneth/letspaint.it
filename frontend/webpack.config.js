var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');

module.exports = {
  devtool: 'eval-source-map',
  context: __dirname,
  entry: [
    'webpack/hot/dev-server',
    'webpack-dev-server/client?http://localhost:5000',
    path.join(__dirname, 'app', 'index.js')
  ],
  output: {
    path: path.join(__dirname, 'public'),
    publicPath: 'http://localhost:5000/',
    filename: 'bundle.js'
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true,
    colors: true,
    stats: 'errors-only',
    contentBase: './public',
    port: 5000
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
      utils: path.resolve(__dirname, 'app/utils/'),
      _common: path.resolve(__dirname, 'app/components/_common'),
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
        'NODE_ENV': JSON.stringify('development'),
        'DEVTOOLS': false,
        'WS_URL': JSON.stringify('ws://localhost:4000/ws')
      }
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  postcss: [ autoprefixer({ browserslist: ['> 5%', 'last 2 versions'] }) ]
};
