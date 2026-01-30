
export default {
  getCurrentPages: () => [],
  navigateTo: () => {},
  redirectTo: () => {},
  navigateBack: () => {},
  switchTab: () => {},
  reLaunch: () => {},
  showToast: () => {},
  hideToast: () => {},
  showLoading: () => {},
  hideLoading: () => {},
  getStorageSync: () => {},
  setStorageSync: () => {},
  removeStorageSync: () => {},
  request: () => Promise.resolve({ data: {} }),
  createSelectorQuery: () => ({
    select: () => ({
      boundingClientRect: () => ({
        exec: (cb) => cb && cb([{ top: 0, height: 0 }])
      })
    }),
    in: () => ({
      select: () => ({
        boundingClientRect: () => ({
          exec: (cb) => cb && cb([{ top: 0, height: 0 }])
        })
      })
    })
  }),
  useDidShow: () => {},
  useDidHide: () => {},
  useRouter: () => ({ params: {} }),
  pxTransform: (size) => size + 'px',
}

export const useDidShow = () => {}
export const useDidHide = () => {}
export const useRouter = () => ({ params: {} })
export const pxTransform = (size) => size + 'px'
