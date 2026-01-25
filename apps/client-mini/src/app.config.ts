export default {
    pages: [
        'pages/index/index',
        'pages/login/index',
        'pages/category/index',
        'pages/recycle/index',
        'pages/order/index',
        'pages/order/confirm/index',
        'pages/order/detail/index',
        'pages/pricing/index',
        'pages/profile/index',
        'pages/profile/edit/index',
        'pages/settings/index',
        'pages/agreement/index',
        'pages/withdrawal/index',
        'pages/withdrawal/list/index',
        'pages/withdrawal/detail/index',
        'pages/transaction/list/index',
    ],
    subpackages: [
        {
            root: 'pages/address',
            pages: [
                'index',
                'select/index',
                'form/index'
            ]
        }
    ],
    window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#F5F5F0',
        navigationBarTitleText: 'OneRecycle',
        navigationBarTextStyle: 'black',
        backgroundColor: '#F5F5F0',
        navigationStyle: 'custom'
    },
    tabBar: {
        color: '#636E72',
        selectedColor: '#2E7D32',
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
                pagePath: 'pages/order/index',
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
    },
    requiredPrivateInfos: [
        'getLocation'
    ]
}
