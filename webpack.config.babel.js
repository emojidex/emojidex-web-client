import path from 'path'
import webpack from 'webpack'

module.exports = (env, argv) => ({
  entry: {
    'emojidex-client': './src/es6/index.js',
  },
  resolve: {
    modules: [
      'node_modules'
    ]
  },
  output: {
    filename: `emojidex-client.${argv.mode === 'production' ? 'min.' : ''}js`,
    path: path.join(__dirname, './dist/js'),
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
  ],
  node: {
    fs: 'empty'
  }
})
