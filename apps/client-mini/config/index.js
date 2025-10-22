const path = require('path')

const config = {
    projectName: 'one-recycle-mini',
    date: '2025-10-2',
    designWidth: 750,
    deviceRatio: {
        640: 2.34 / 2,
        750: 1,
        828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [],
    defineConstants: {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    },
    alias: {
        '@': path.resolve(__dirname, '..', 'src'),
    },
    copy: {
        patterns: [],
        options: {}
    },
    framework: 'react',
    compiler: 'webpack5',
    cache: {
        enable: false // 禁用缓存
    },
    mini: {
        postcss: {
            pxtransform: {
                enable: true,
                config: {}
            },
            url: {
                enable: true,
                config: {
                    limit: 1024 // 设定转换尺寸上限
                }
            },
            cssModules: {
                enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
                config: {
                    namingPattern: 'module', // 转换模式，取值为 global/module
                    generateScopedName: '[name]__[local]___[hash:base64:5]'
                }
            }
        },
        // 配置 webpack 来解决 CSS 模块冲突和循环依赖
        webpackChain(chain) {
            // 配置 optimization 来处理 CSS 冲突
            chain.optimization.splitChunks({
                chunks: 'all',
                cacheGroups: {
                    // 将 Taroify 组件提取到独立 chunk，避免循环依赖
                    taroify: {
                        name: 'taroify',
                        test: /[\\/]node_modules[\\/]@taroify[\\/]/,
                        priority: 30,
                        chunks: 'all',
                        enforce: true
                    }
                }
            })
        }
    },
    h5: {
        publicPath: '/',
        staticDirectory: 'static',
        postcss: {
            autoprefixer: {
                enable: true,
                config: {}
            },
            cssModules: {
                enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
                config: {
                    namingPattern: 'module', // 转换模式，取值为 global/module
                    generateScopedName: '[name]__[local]___[hash:base64:5]'
                }
            }
        }
    }
}

module.exports = function (merge) {
    if (process.env.NODE_ENV === 'development') {
        return merge({}, config, require('./dev'))
    }
    return merge({}, config, require('./prod'))
}