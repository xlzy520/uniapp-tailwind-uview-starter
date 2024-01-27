const { WeappTailwindcssDisabled } = require('./platform');
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin');

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
  //....
  configureWebpack: {
    plugins: [
      new UnifiedWebpackPluginV5({
        disabled: WeappTailwindcssDisabled,
      }),
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          vue: {
            name: 'pages-index-video',
            test: /[\\/]node_modules[\\/](vue|vuex|vue-router|element-ui)[\\/]/,
            chunks: 'all',
          },
          common: {
            name: 'pages-index-list',
            minChunks: 1,
            chunks: 'async',
            priority: -20,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      },
      runtimeChunk: false,
    },
  },
  devServer: {
    port: 8081,
  },
  chainWebpack: (config) => {
    // 去除ts类型检测，因为uni-app ts type 支持其实不咋好
    config.plugins.delete('fork-ts-checker');
  },
  transpileDependencies: ['uview-ui'],
  //....
};

module.exports = config;
