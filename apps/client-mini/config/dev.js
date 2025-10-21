module.exports = {
    env: {
        NODE_ENV: '"development"'
    },
    defineConstants: {
    },
    mini: {},
    h5: {
        devServer: {
            port: 10086,
            host: '0.0.0.0',
            historyApiFallback: {
                index: '/index.html'
            },
            static: {
                directory: require('path').join(__dirname, '../'),
                publicPath: '/',
                serveIndex: false
            },
            // 添加代理配置，虽然我们使用客户端mock，但这可以作为备用
            proxy: {
                '/api': {
                    target: 'http://localhost:3000',
                    changeOrigin: true,
                    pathRewrite: {
                        '^/api': ''
                    }
                }
            }
        }
    },
    // 禁用 ESLint 检查以避免版本冲突
    eslint: {
        enable: false
    }
}