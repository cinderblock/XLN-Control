var path = require('path');

module.exports = {
  module: {
    loaders: [
      {
      test: /\.jsx?$/,
      loader: 'babel',
      query: {
        presets: ['es2015','stage-0','react']
      },
      exclude: /node_modules/
    },
    { test: /\.(png|woff|woff2|eot|ttf|svg)(\?.*)?$/, loader: 'url-loader?limit=100000' }
  ]},
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
  },
  plugins: [

  ],
  externals: [
    // put your node 3rd party libraries which can't be built with webpack here (mysql, mongodb, and so on..)
    'config',
  ]
};
