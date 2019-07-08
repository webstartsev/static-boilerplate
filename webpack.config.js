const path = require('path');
const webpack = require('webpack');
const argv = require('yargs').argv;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano = require('cssnano');

const { getDirectoriesBasenames } = require('./build/utils.js');
const isProd = argv.mode === 'production';

const pages = getDirectoriesBasenames(path.resolve('./src/pages'));

const instances = pages.map(page => {
    return new HtmlWebpackPlugin({
        template: `./pages/${page}/${page}.pug`,
        excludeAssets: [/-critical.css$/],
        filename: `${page}.html`,
        chunks: ['common', `${page}`]
    });
});

const entries = pages.reduce((acc, page, i) => {
    acc[page] = `./pages/${page}/${page}.js`;
    return acc;
}, {});

Object.assign(entries, { common: './pages/layout.js' });

const externalCSS = new MiniCssExtractPlugin({
    filename: 'assets/css/[name].css',
    chunkFilename: '[id].css'
});
const fileLoaderChain = [
    {
        loader: 'file-loader',
        query: {
            useRelativePath: false,
            name: '[path][name].[ext]'
            // context: path.resolve(__dirname, 'src'),
        }
    }
];

const config = {
    context: path.resolve(__dirname, 'src'),
    entry: entries,
    output: {
        filename: 'assets/js/[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.js', '.scss', '.pug'],
        alias: {
            Components: path.resolve(__dirname, 'src/components/'),
            '@': path.resolve(__dirname, 'src'),
            assets: path.resolve(__dirname, 'src/assets/'),
            public: path.resolve(__dirname, 'public/'),
            dist: path.resolve(__dirname, 'dist')
        }
    },
    // optimization: {
    //     splitChunks: {
    //         chunks: 'all'
    //     }
    // },
    optimization: {
        minimizer: [
            new UglifyJsPlugin(),
            new OptimizeCSSAssetsPlugin({
                cssProcessor: cssnano,
                canPrint: false
            })
        ],
        splitChunks: {
            cacheGroups: {
                styles: {
                    name: 'styles',
                    test: /\.css$/,
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
    mode: isProd ? 'production' : 'development',
    watch: !isProd,
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                include: path.resolve(__dirname, 'src'),
                options: {
                    formatter: require('eslint-friendly-formatter')
                }
            },
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'src'),
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
                            sourceMap: !isProd,
                            minimize: isProd
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: !isProd
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: !isProd
                        }
                    }
                ]
            },
            {
                test: /\.(svg|png|jpg|gif|otf|ttf|woff|woff2|mp4)$/,
                use: fileLoaderChain
            },
            {
                test: /\.svg$/,
                include: path.resolve(__dirname, 'node_modules'),
                use: fileLoaderChain
            },
            // {
            //     test: /\.svg$/,
            //     exclude: path.resolve(__dirname, 'node_modules'),
            //     use: 'svg-sprite-loader'
            // },
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
            }
        ]
    },
    plugins: [
        ...instances,
        externalCSS,
        !isProd && new webpack.HotModuleReplacementPlugin(),
        isProd &&
            new CopyWebpackPlugin([
                {
                    from: path.resolve(__dirname, 'public'),
                    to: path.resolve(__dirname, 'dist')
                }
            ]),
        new CleanWebpackPlugin(['dist'])
    ].filter(Boolean)
};

module.exports = config;
