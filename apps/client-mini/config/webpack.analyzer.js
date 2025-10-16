/**
 * Webpack Bundle Analyzer Configuration
 * Use this to analyze and optimize bundle sizes
 */

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: '../bundle-report.html',
      openAnalyzer: false,
      generateStatsFile: true,
      statsFilename: '../bundle-stats.json',
      statsOptions: {
        source: false,
        reasons: true,
        chunks: true,
        modules: true,
        chunkModules: true,
      },
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor chunk for node_modules
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true,
        },
        // Common chunk for shared code
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
        // Taro framework chunk
        taro: {
          test: /[\\/]node_modules[\\/]@tarojs[\\/]/,
          name: 'taro',
          priority: 20,
          reuseExistingChunk: true,
        },
        // UI library chunk
        taroify: {
          test: /[\\/]node_modules[\\/]@taroify[\\/]/,
          name: 'taroify',
          priority: 15,
          reuseExistingChunk: true,
        },
        // Styles chunk
        styles: {
          name: 'styles',
          test: /\.(css|scss)$/,
          chunks: 'all',
          enforce: true,
          priority: 25,
        },
      },
    },
    runtimeChunk: {
      name: 'runtime',
    },
    minimize: true,
  },
};
