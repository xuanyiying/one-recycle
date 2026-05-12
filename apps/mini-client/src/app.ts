import { migrateFromLocalStorage } from '@/store/useStore'
import { initErrorTracking } from '@/utils/errorTracker'
import { logger } from '@/utils/logger'
import Taro, { useDidHide, useDidShow } from '@tarojs/taro'
import React, { useEffect } from 'react'
import './app.scss'

function App(props: { children?: React.ReactNode }) {
  const handleInviteCode = (options: any) => {
    if (options.scene === 1047 && options.query?.scene) {
      const scene = decodeURIComponent(options.query.scene);
      const params = new URLSearchParams(scene);
      const inviteCode = params.get('invite');
      if (inviteCode) {
        saveInviteCode(inviteCode);
      }
    }

    if (options.scene === 1007 && options.query?.inviteCode) {
      saveInviteCode(options.query.inviteCode);
    }

    if (options.query?.inviteCode) {
      saveInviteCode(options.query.inviteCode);
    }
  };

  const saveInviteCode = (inviteCode: string) => {
    logger.log('[Referral] Saving invite code:', inviteCode);
    Taro.setStorageSync('invite_code', inviteCode);
    const expireAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    Taro.setStorageSync('invite_code_expire', expireAt);
  };

  useEffect(() => {
    migrateFromLocalStorage()
    initErrorTracking()

    if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
      return
    }
    if (!Taro.getUpdateManager) {
      return
    }
    const updateManager = Taro.getUpdateManager()
    updateManager.onCheckForUpdate(() => { })
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

  useDidShow(() => {
    const launchOptions = Taro.getLaunchOptionsSync();
    handleInviteCode(launchOptions);
  })

  useDidHide(() => { })

  return React.createElement(React.Fragment, null, props.children)
}

export default App
