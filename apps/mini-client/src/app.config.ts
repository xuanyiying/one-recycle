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
        'pages/points-rules/index',
        'pages/transaction/list/index',
        'pages/rank/index',
        'pages/recycle-rules/index',
        'pages/error/index',
        'pages/customer/index',      // 客服功能保留，移除AI自动回复
        // 'pages/voice-order/index',  // AI功能：语音下单 - 已禁用
        'pages/referral/index',
    ],
    subpackages: [
        {
            root: 'pages/address',
            pages: [
                'index',
                'select/index',
                'form/index'
            ]
        },
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
            // {
            //     pagePath: 'pages/voice-order/index',  // AI功能：语音下单 - 已禁用
            //     text: '语音下单',
            //     iconPath: 'assets/icons/voice.png',
            //     selectedIconPath: 'assets/icons/voice-active.png'
            // },
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
        },
        'scope.camera': {
            desc: '用于拍摄物品照片，便于估价与下单'
        },
        'scope.writePhotosAlbum': {
            desc: '用于从相册选择物品或头像照片'
        }
    },
    requiredPrivateInfos: [
        'getLocation',
        'chooseLocation'
    ]
}
