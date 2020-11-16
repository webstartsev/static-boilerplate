const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

const {getDirectoriesBasenames} = require('./build/utils.js');

const NODE_ENV = process.env.NODE_ENV;

const PATHS = {
  src: path.resolve(__dirname, 'src'),
  public: path.resolve(__dirname, 'public'),
  dist: path.resolve(__dirname, 'dist'),
  assets: path.resolve(__dirname, 'src', 'assets'),
  components: path.resolve(__dirname, 'src', 'components')
};

const PAGES_DIR = path.resolve(PATHS.src, 'pages');
const PAGES = getDirectoriesBasenames(PAGES_DIR);

const entries = PAGES.reduce((acc, page, i) => {
  acc[page] = `./pages/${page}/${page}.js`;
  return acc;
}, {});

const config = {
  mode: NODE_ENV ? NODE_ENV : 'development',
  context: path.resolve(__dirname, 'src'),
  entry: entries,
  output: {
    filename: 'assets/js/[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: 'vendors',
          test: /node_modules/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  devServer: {
    hot: false,
    open: true
  },
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: [
          'html-loader',
          {
            loader: 'pug-html-loader',
            options: {
              basedir: path.resolve(__dirname, 'src'),
              pretty: true
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: '/node_modules/',
        use: 'babel-loader'
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../../'
            }
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].css',
      chunkFilename: '[id].css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {from: PATHS.public, to: PATHS.dist}
      ]
    }),
    ...PAGES.map(page => {
      return new HtmlWebpackPlugin({
        template: `./pages/${page}/${page}.pug`,
        excludeAssets: [/-critical.css$/],
        filename: `${page}.html`,
        chunks: [page]
      });
    })
  ]
};

module.exports = config;
