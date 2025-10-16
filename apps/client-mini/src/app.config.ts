export default {
    pages: [
        'pages/index/index',
        'pages/login/index',
        'pages/category/index',
        'pages/recycle/index',
        'pages/recycle/form/index',
        'pages/address/select/index',
        'pages/order/index',
        'pages/order/confirm/index',
        'pages/order/detail/index',
        'pages/order/list/index',
        'pages/pricing/index',
        'pages/profile/index',
        'pages/profile/edit/index',
        'pages/settings/index',
        'pages/address/index',
        'pages/address/form/index',
        'pages/agreement/index',
        'pages/withdrawal/index',
        'pages/withdrawal/list',
        'pages/withdrawal/detail',
        'pages/transaction/list'
    ],
    window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#00c896',
        navigationBarTitleText: '支付宝回收',
        navigationBarTextStyle: 'white',
        navigationStyle: 'default'
    },
    tabBar: {
        custom: true,
        color: '#666666',
        selectedColor: '#00c896',
        backgroundColor: '#ffffff',
        borderStyle: 'black',
        list: [
            {
                pagePath: 'pages/index/index',
                text: '首页'
            },
            {
                pagePath: 'pages/recycle/index',
                text: '回收'
            },
            {
                pagePath: 'pages/order/list/index',
                text: '订单'
            },
            {
                pagePath: 'pages/profile/index',
                text: '我的'
            }
        ]
    },
    permission: {
        'scope.userLocation': {
            desc: '用于获取位置信息，展示附近回收点并提供上门服务范围'
        }
    }
}