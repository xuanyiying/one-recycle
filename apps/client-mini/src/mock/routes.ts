import { addressMockData, mockManager, userMockData } from './index'
import { authMockData } from './auth'
import { categoryMockData } from './category'
import { orderMockData } from './order'
import { accountMockData } from './account'
import { paymentMockData } from './payment'
import { notificationMockData } from './notification'
import { systemMockData } from './system'

// 注册所有mock路由
export const registerAllMockRoutes = () => {
  console.log('[Mock Routes] ==================== Registering Mock Routes ====================')
  
  try {
    // 认证相关路由
    console.log('[Mock Routes] Registering auth routes...')
    mockManager.registerRoute('POST /auth/login', async (data) => authMockData.login(data))
    mockManager.registerRoute('GET /auth/user', async () => authMockData.getUserInfo())
    mockManager.registerRoute('POST /auth/wechat', async (data) => authMockData.wechatLogin(data))
    mockManager.registerRoute('POST /auth/alipay', async (data) => authMockData.alipayLogin(data))
    mockManager.registerRoute('POST /auth/douyin', async (data) => authMockData.douyinLogin(data))
    
    // 适配新的 Service 路由 (namespaced)
    mockManager.registerRoute('POST /auth/third-party/wechat', async (data) => authMockData.wechatLogin(data))
    mockManager.registerRoute('POST /auth/third-party/alipay', async (data) => authMockData.alipayLogin(data))
    mockManager.registerRoute('POST /auth/third-party/douyin', async (data) => authMockData.douyinLogin(data))
    mockManager.registerRoute('POST /account/auth/login', async (data) => authMockData.login(data))

    // 分类相关路由
    console.log('[Mock Routes] Registering category routes...')
    mockManager.registerRoute('GET /system/banners', async () => {
      console.log('[Mock Routes] Handling GET /system/banners')
      return categoryMockData.getBanners()
    })
    mockManager.registerRoute('GET /category/categories', async () => {
      console.log('[Mock Routes] Handling GET /category/categories')
      return categoryMockData.getActiveCategories()
    })
    mockManager.registerRoute('GET /category/categories/active', async () => {
      console.log('[Mock Routes] Handling GET /category/categories/active')
      return categoryMockData.getActiveCategories()
    })
    mockManager.registerRoute('GET /system/articles', async (data) => {
      console.log('[Mock Routes] Handling GET /system/articles with data:', data)
      return categoryMockData.getArticles(data?.categoryId)
    })
  
  // 保留原有的路由以兼容其他调用
  mockManager.registerRoute('GET /categories/active', async () => categoryMockData.getActiveCategories())
  mockManager.registerRoute('GET /categories', async () => categoryMockData.getAllCategories())
  mockManager.registerRoute('GET /categories/:id', async (_, params) => categoryMockData.getCategoryDetail(params?.id || ''))
  mockManager.registerRoute('GET /api/category/:id', async (_, params) => categoryMockData.getCategoryDetail(params?.id || ''))
  mockManager.registerRoute('GET /api/articles/:id', async (_, params) => categoryMockData.getArticleDetail(params?.id || ''))

  // 订单相关路由
  mockManager.registerRoute('POST /orders', async (data) => orderMockData.createOrder(data))
  mockManager.registerRoute('GET /orders', async (data) => orderMockData.getUserOrders(data?.userId || 'user_001'))
  mockManager.registerRoute('GET /orders/:id', async (_, params) => orderMockData.getOrderDetail(params?.id || ''))
  mockManager.registerRoute('PUT /orders/:id/cancel', async (_, params) => orderMockData.cancelOrder(params?.id || ''))
  mockManager.registerRoute('PUT /orders/:id/status', async (data, params) => orderMockData.updateOrderStatus(params?.id || '', data?.status || 'confirmed'))
  mockManager.registerRoute('POST /orders/:id/express', async (data, params) => orderMockData.createExpressOrder({ orderId: params?.id, ...(data || {}) }))
  mockManager.registerRoute('GET /users/statistics', async (data) => orderMockData.getUserStatistics(data?.userId || 'user_001'))
  mockManager.registerRoute('PUT /orders/:id/confirm', async (_, params) => orderMockData.confirmOrder(params?.id || ''))

  // 适配新的 Service 路由 (namespaced - Order)
  mockManager.registerRoute('POST /order/orders', async (data) => orderMockData.createOrder(data))
  mockManager.registerRoute('GET /order/orders/user/:userId', async (_, params) => orderMockData.getUserOrders(params?.userId || 'user_001'))
  // 兼容 userId 为空的情况
  mockManager.registerRoute('GET /order/orders/user/', async () => orderMockData.getUserOrders('user_001'))
  
  mockManager.registerRoute('GET /order/orders/:id', async (_, params) => orderMockData.getOrderDetail(params?.id || ''))
  mockManager.registerRoute('PUT /order/orders/:id/cancel', async (_, params) => orderMockData.cancelOrder(params?.id || ''))
  mockManager.registerRoute('PUT /order/orders/:id/status', async (data, params) => orderMockData.updateOrderStatus(params?.id || '', data?.status || 'confirmed'))
  mockManager.registerRoute('GET /order/orders/user/:userId/statistics', async (_, params) => orderMockData.getUserStatistics(params?.userId || 'user_001'))
  // 兼容 userId 为空的情况
  mockManager.registerRoute('GET /order/orders/user//statistics', async () => orderMockData.getUserStatistics('user_001'))

  mockManager.registerRoute('PUT /order/orders/:id/confirm', async (_, params) => orderMockData.confirmOrder(params?.id || ''))
  mockManager.registerRoute('POST /dispatch/express/orders', async (data) => orderMockData.createExpressOrder(data))

  // 账户相关路由
  mockManager.registerRoute('GET /user/addresses', async (data) => addressMockData.getUserAddresses(data?.userId || 'user_001'))
  mockManager.registerRoute('POST /user/addresses', async (data) => addressMockData.addAddress(data))
  mockManager.registerRoute('PUT /user/addresses/:id', async (data, params) => addressMockData.updateAddress(params?.id || '', data))
  mockManager.registerRoute('DELETE /user/addresses/:id', async (_, params) => addressMockData.deleteAddress(params?.id || ''))
  mockManager.registerRoute('GET /user/profile', async (data) => userMockData.getUserProfile(data?.userId || 'user_001'))
  mockManager.registerRoute('PUT /user/profile', async (data) => userMockData.updateUserProfile(data?.userId || 'user_001', data))
  
  // 适配新的 Service 路由 (namespaced - Account)
  mockManager.registerRoute('GET /api/accounts/me', async () => accountMockData.getMyAccount())
  mockManager.registerRoute('GET /api/accounts/me/stats', async () => accountMockData.getMyStats())
  
  mockManager.registerRoute('GET /addresses/user/:userId', async (_, params) => addressMockData.getUserAddresses(params?.userId || 'user_001'))
    mockManager.registerRoute('GET /addresses/regions/:parentCode', async (_, params) => addressMockData.getRegions(params?.parentCode || '000000'))
    mockManager.registerRoute('POST /addresses', async (data) => addressMockData.addAddress(data))
    mockManager.registerRoute('PUT /addresses/:id', async (data, params) => addressMockData.updateAddress(params?.id || '', data))
    mockManager.registerRoute('DELETE /addresses/:id', async (_, params) => addressMockData.deleteAddress(params?.id || ''))
    
    // 保留旧的路径以防万一
    mockManager.registerRoute('GET /account/addresses/user/:userId', async (_, params) => addressMockData.getUserAddresses(params?.userId || 'user_001'))
    mockManager.registerRoute('POST /account/addresses', async (data) => addressMockData.addAddress(data))
    mockManager.registerRoute('PUT /account/addresses/:id', async (data, params) => addressMockData.updateAddress(params?.id || '', data))
    mockManager.registerRoute('PUT /account/addresses/:id/delete', async (_, params) => addressMockData.deleteAddress(params?.id || ''))
  mockManager.registerRoute('GET /account/users/:id', async (_, params) => userMockData.getUserProfile(params?.id || 'user_001'))
  mockManager.registerRoute('PUT /account/users/:id', async (data, params) => userMockData.updateUserProfile(params?.id || 'user_001', data))

  mockManager.registerRoute('GET /user/wallet', async (data) => accountMockData.getWallet(data?.userId || 'user_001'))
  mockManager.registerRoute('GET /user/transactions', async (data) => accountMockData.getTransactions(data?.userId || 'user_001', data?.page, data?.limit))
  mockManager.registerRoute('POST /user/withdrawal', async (data) => accountMockData.requestWithdrawal(data?.userId || 'user_001', data?.amount))
  mockManager.registerRoute('POST /user/verify', async (data) => userMockData.verifyIdentity(data?.userId || 'user_001', data?.realName, data?.idCard))

  // 支付相关路由
  mockManager.registerRoute('POST /payments', async (data) => paymentMockData.createOrder(
    data?.orderId || '',
    Number(data?.amount ?? 0),
    (data?.method || 'wechat') as 'wechat' | 'alipay' | 'bankcard'
  ))
  mockManager.registerRoute('GET /payments/:id/status', async (_, params) => paymentMockData.getStatus(params?.id || ''))
  mockManager.registerRoute('GET /payments', async () => paymentMockData.getRecords())
  mockManager.registerRoute('POST /refunds', async (data) => paymentMockData.requestRefund(
    data?.orderId || '',
    Number(data?.amount ?? 0)
  ))
  mockManager.registerRoute('GET /refunds/:id/status', async (_, params) => paymentMockData.getRefundStatus(params?.id || ''))
  mockManager.registerRoute('GET /user/bank-cards', async (data) => paymentMockData.getBankCards(data?.userId || 'user_001'))
  mockManager.registerRoute('POST /user/bank-cards', async (data) => paymentMockData.addBankCard(data))
  mockManager.registerRoute('DELETE /user/bank-cards/:id', async (_, params) => paymentMockData.deleteBankCard(params?.id || ''))
  mockManager.registerRoute('POST /payments/wechat', async (data) => paymentMockData.wechatPay(data))
  mockManager.registerRoute('POST /payments/alipay', async (data) => paymentMockData.alipayPay(data))

  // 通知相关路由
  mockManager.registerRoute('GET /notifications', async (data) => notificationMockData.getNotifications(data?.userId || 'user_001', data?.type, data?.status, data?.page, data?.limit))
  mockManager.registerRoute('GET /notifications/unread-count', async (data) => notificationMockData.getUnreadCount(data?.userId || 'user_001'))
  mockManager.registerRoute('PUT /notifications/:id/read', async (_, params) => notificationMockData.markAsRead(params?.id || ''))
  mockManager.registerRoute('PUT /notifications/read-all', async (data) => notificationMockData.markAllAsRead(data?.userId || 'user_001'))
  mockManager.registerRoute('DELETE /notifications/:id', async (_, params) => notificationMockData.deleteNotification(params?.id || ''))
  mockManager.registerRoute('DELETE /notifications', async (data) => notificationMockData.clearAllNotifications(data?.userId || 'user_001'))
  mockManager.registerRoute('GET /notifications/settings', async (data) => notificationMockData.getNotificationSettings(data?.userId || 'user_001'))
  mockManager.registerRoute('PUT /notifications/settings', async (data) => notificationMockData.updateNotificationSettings(data?.userId || 'user_001', data?.settings || data))
  mockManager.registerRoute('POST /notifications', async (data) => notificationMockData.sendNotification(data))
  mockManager.registerRoute('GET /notifications/:id', async (_, params) => notificationMockData.getNotificationDetail(params?.id || ''))

  // 系统相关路由
  mockManager.registerRoute('GET /system/config', async (data) => systemMockData.getSystemConfig(data?.key))
  // 适配 Service 路由
  mockManager.registerRoute('GET /category/config', async (data) => systemMockData.getSystemConfig(data?.key))
  mockManager.registerRoute('GET /category/cities', async () => systemMockData.getCities())

  mockManager.registerRoute('GET /system/version', async () => systemMockData.getVersionInfo())
  mockManager.registerRoute('GET /system/update', async (data) => systemMockData.checkUpdate(data?.currentVersion || '1.0.0'))
  mockManager.registerRoute('POST /system/feedback', async (data) => systemMockData.submitFeedback(data))
  mockManager.registerRoute('GET /user/feedbacks', async (data) => systemMockData.getUserFeedbacks(data?.userId || 'user_001'))
  mockManager.registerRoute('GET /system/faqs', async (data) => systemMockData.getFAQs(data?.category))
  mockManager.registerRoute('GET /system/faq-categories', async () => systemMockData.getFAQCategories())
  mockManager.registerRoute('GET /system/announcements', async (data) => systemMockData.getAnnouncements(data?.userId || 'user_001'))
  mockManager.registerRoute('GET /system/customer-service', async () => systemMockData.getCustomerService())
  mockManager.registerRoute('POST /system/upload', async (data) => systemMockData.uploadImage(data))

  console.log('[Mock Routes] ==================== Route Registration Complete ====================')
  console.log('[Mock Routes] Total routes registered:', Object.keys(mockManager.getRoutes()).length)
  
  // 运行诊断检查
  console.log('[Mock Routes] Running post-registration diagnosis...')
  mockManager.diagnose()
  
  } catch (error) {
    console.error('[Mock Routes] ❌ Error during route registration:', error)
    throw error
  }
}