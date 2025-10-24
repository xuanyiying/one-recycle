export default {
    pages: [
        'pages/index/index',
        'pages/login/index',
        'pages/category/index',
        'pages/recycle/index',
        'pages/address/select/index',
        'pages/order/list/index',
        'pages/order/confirm/index',
        'pages/order/detail/index',
        'pages/pricing/index',
        'pages/profile/index',
        'pages/profile/edit/index',
        'pages/settings/index',
        'pages/address/index',
        'pages/address/form/index',
        'pages/agreement/index',
        'pages/withdrawal/index',
        'pages/withdrawal/list/index',
        'pages/withdrawal/detail/index',
        'pages/transaction/list/index',
    ],
    window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#00c896',
        navigationBarTitleText: '爱回收',
        navigationBarTextStyle: 'white',
        navigationStyle: 'default'
    },
    tabBar: {
        color: '#666666',
        selectedColor: '#00c896',
        backgroundColor: '#ffffff',
        borderStyle: 'black',
        list: [
            {
                pagePath: 'pages/index/index',
                text: '首页',
                iconPath: 'assets/icons/home.png',
                selectedIconPath: 'assets/icons/home-active.png'
            },
            {
                pagePath: 'pages/recycle/index',
                text: '回收',
                iconPath: 'assets/icons/recycle.png',
                selectedIconPath: 'assets/icons/recycle-active.png'
            },
            {
                pagePath: 'pages/order/list/index',
                text: '订单',
                iconPath: 'assets/icons/order.png',
                selectedIconPath: 'assets/icons/order-active.png'
            },
            {
                pagePath: 'pages/profile/index',
                text: '我的',
                iconPath: 'assets/icons/profile.png',
                selectedIconPath: 'assets/icons/profile-active.png'
            }
        ]
    },
    permission: {
        'scope.userLocation': {
            desc: '用于获取位置信息，展示附近回收点并提供上门服务范围'
        }
    }
}