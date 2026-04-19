// @ts-ignore
import React, { useEffect } from 'react'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
import { AppProvider } from '@/store'
import { logger } from '@/utils/logger'
// 全局样式
import './app.scss'

function App(props: { children?: React.ReactNode }) {
  // 处理启动参数中的邀请码
  const handleInviteCode = (options: any) => {
    // 场景值：1047 表示扫描小程序码
    if (options.scene === 1047 && options.query?.scene) {
      const scene = decodeURIComponent(options.query.scene);
      const params = new URLSearchParams(scene);
      const inviteCode = params.get('invite');
      if (inviteCode) {
        saveInviteCode(inviteCode);
      }
    }

    // 场景值：1007 表示分享卡片
    if (options.scene === 1007 && options.query?.inviteCode) {
      saveInviteCode(options.query.inviteCode);
    }

    // H5 场景：链接参数
    if (options.query?.inviteCode) {
      saveInviteCode(options.query.inviteCode);
    }
  };

  // 保存邀请码到本地 storage
  const saveInviteCode = (inviteCode: string) => {
    logger.log('[Referral] Saving invite code:', inviteCode);
    Taro.setStorageSync('invite_code', inviteCode);
    // 设置过期时间（7天后）
    const expireAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    Taro.setStorageSync('invite_code_expire', expireAt);
  };

  // 可以使用所有的 React Hooks
  useEffect(() => {
    if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
      return
    }
    if (!Taro.getUpdateManager) {
      return
    }
    const updateManager = Taro.getUpdateManager()
    updateManager.onCheckForUpdate(() => {})
    updateManager.onUpdateReady(() => {
      Taro.showModal({
        title: '更新提示',
        content: '新版本已准备好，是否重启应用？',
        showCancel: false,
        confirmText: '立即更新',
        success: () => {
          updateManager.applyUpdate()
        }
      })
    })
    updateManager.onUpdateFailed(() => {
      Taro.showToast({
        title: '更新失败，请稍后重试',
        icon: 'none'
      })
    })
  }, [])

  // 对应 onShow - 处理启动参数
  useDidShow(() => {
    const launchOptions = Taro.getLaunchOptionsSync();
    handleInviteCode(launchOptions);
  })

  // 对应 onHide
  useDidHide(() => {})

  return React.createElement(AppProvider, null, props.children)
}

export default App
