const path = require('path')

const config = {
  projectName: 'client-mini',
  date: '2025-10-24',
  designWidth: 375,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2 / 1
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-html'],
  defineConstants: {
  },
  copy: {
    patterns: [
    ],
    options: {
    }
  },
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: { enable: false }
  },
  alias: {
    '@': path.resolve(__dirname, '..', 'src')
  },
  mini: {
    // 添加 miniCssExtractPluginOptions 配置来解决 CSS 冲突
    miniCssExtractPluginOptions: {
      ignoreOrder: true
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          selectorBlackList: ['nut-']
        }
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
    // 配置 webpack 来解决 CSS 模块冲突
    webpackChain(chain: any) {
      // 检查并配置 MiniCssExtractPlugin
      if (chain.plugins.has('MiniCssExtractPlugin')) {
        chain.plugin('MiniCssExtractPlugin').tap((args: any[]) => {
          if (!args[0]) args[0] = {}
          args[0].ignoreOrder = true
          return args
        })
      }
      
      // 添加自定义插件来过滤 CSS 冲突警告
      chain.plugin('IgnoreCSSConflicts').use(class {
        apply(compiler: any) {
          compiler.hooks.compilation.tap('IgnoreCSSConflicts', (compilation: any) => {
            compilation.hooks.processWarnings.tap('IgnoreCSSConflicts', (warnings: any[]) => {
              return warnings.filter((warning: any) => {
                const message = warning.message || warning.toString()
                return !message.includes('Conflicting order') && 
                       !message.includes('mini-css-extract-plugin')
              })
            })
          })
        }
      })
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    esnextModules: ['nutui-react'],
    // 添加 miniCssExtractPluginOptions 配置来解决 CSS 冲突
    miniCssExtractPluginOptions: {
      ignoreOrder: true
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          selectorBlackList: ['nut-']
        }
      },
      autoprefixer: {
        enable: true,
        config: {
        }
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

module.exports = function (merge: any) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
