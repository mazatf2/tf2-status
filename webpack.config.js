const path = require('path')
const webpack = require('webpack')
const WorkboxPlugin = require('workbox-webpack-plugin')

/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */

const HtmlWebpackPlugin = require('html-webpack-plugin')

/*
 * We've enabled HtmlWebpackPlugin for you! This generates a html
 * page for you when you compile webpack, which will make you start
 * developing and prototyping faster.
 *
 * https://github.com/jantimon/html-webpack-plugin
 *
 */

module.exports = {
	mode: 'development',
	entry: './src/main.js',

	output: {
		filename: '[name].[chunkhash].js',
		path: path.resolve(__dirname, 'dist'),
	},

	plugins: [
		new webpack.ProgressPlugin(),
		new HtmlWebpackPlugin({
			template: './src/tf2-status.html',
			inject: true,
		}),
		new WorkboxPlugin.GenerateSW({
			clientsClaim: true, //force use newest sw
			skipWaiting: true, //force use newest sw
			runtimeCaching: [
				{
					urlPattern: new RegExp('^http://api.etf2l.org'),
					handler: 'CacheFirst',
					options: {
						cacheName: 'etf2l api',
						expiration: {
							maxAgeSeconds: 60 * 30, // 30 minutes
						},
						cacheableResponse: {statuses: [0, 200]},
					},
				},
				{
					urlPattern: new RegExp('/api/'),
					handler: 'CacheFirst',
					options: {
						cacheName: 'etf2l api',
						expiration: {maxAgeSeconds: 60 * 30},
						cacheableResponse: {statuses: [0, 200]},
					},
				},
			],
		}),
	],

	module: {
		rules: [
			{
				test: /.(js|jsx)$/,
				include: [path.resolve(__dirname, 'src')],
				loader: 'babel-loader',

				options: {
					plugins: ['syntax-dynamic-import'],

					presets: [
						[
							'@babel/preset-env',
							{
								modules: false,
							},
						],
					],
				},
			},
		],
	},

	optimization: {
		splitChunks: {
			cacheGroups: {
				vendors: {
					priority: -10,
					test: /[\\/]node_modules[\\/]/,
				},
			},

			chunks: 'async',
			minChunks: 1,
			minSize: 30000,
			name: true,
		},
	},

	devServer: {
		open: true,
	},
}
