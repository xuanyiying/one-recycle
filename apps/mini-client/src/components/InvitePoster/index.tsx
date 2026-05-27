import defaultAvatar from '@/assets/icons/default-avatar.png'
import { getReferralQRCode } from '@/services/referral'
import { logger } from '@/utils/logger'
import { Button, Canvas, Image, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useRef, useState } from 'react'
import './index.scss'

interface InvitePosterProps {
  visible: boolean
  onClose: () => void
  inviteCode: string
  nickname?: string
  avatarUrl?: string
}

const POSTER_WIDTH = 600
const POSTER_HEIGHT = 960
const CANVAS_ID = 'invite-poster-canvas'

const InvitePoster: React.FC<InvitePosterProps> = ({
  visible,
  onClose,
  inviteCode,
  nickname,
  avatarUrl,
}) => {
  const [posterUrl, setPosterUrl] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  const canvasInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (visible && inviteCode) {
      generatePoster()
    }
    if (!visible) {
      setPosterUrl('')
    }
  }, [visible, inviteCode])

  const downloadImage = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      Taro.downloadFile({
        url: src,
        success: (res) => {
          if (res.tempFilePath) {
            resolve(res.tempFilePath)
          } else {
            reject(new Error('下载图片失败'))
          }
        },
        fail: (err) => {
          reject(err)
        },
      })
    })
  }

  const generatePoster = async () => {
    if (!inviteCode) return

    setGenerating(true)
    try {
      const query = Taro.createSelectorQuery()
      query.select(`#${CANVAS_ID}`)
        .fields({ node: true, size: true })
        .exec(async (res) => {
          if (!res || !res[0] || !res[0].node) {
            logger.error('Canvas 节点获取失败')
            setGenerating(false)
            return
          }

          const canvas = res[0].node as any
          canvasInstanceRef.current = canvas
          const ctx = canvas.getContext('2d')

          const dpr = Taro.getSystemInfoSync().pixelRatio
          canvas.width = POSTER_WIDTH * dpr
          canvas.height = POSTER_HEIGHT * dpr
          ctx.scale(dpr, dpr)

          try {
            await drawPoster(ctx, canvas)
          } catch (err) {
            logger.error('绘制海报失败:', err)
            Taro.showToast({ title: '海报生成失败', icon: 'error' })
            setGenerating(false)
          }
        })
    } catch (error) {
      logger.error('生成海报异常:', error)
      Taro.showToast({ title: '海报生成失败', icon: 'error' })
      setGenerating(false)
    }
  }

  const createCanvasImage = (canvas: any): any => {
    if (canvas && typeof canvas.createImage === 'function') {
      return canvas.createImage()
    }
    return null
  }

  const drawPoster = async (ctx: CanvasRenderingContext2D, canvas: any) => {
    const qrRes = await getReferralQRCode(inviteCode)
    let qrImageUrl = ''

    if (qrRes.success && qrRes.data) {
      qrImageUrl = typeof qrRes.data === 'string' ? qrRes.data : qrRes.data.url || qrRes.data.qrCodeUrl || ''
    }

    let qrImg: any = null
    if (qrImageUrl) {
      try {
        const downloadedPath = await downloadImage(qrImageUrl)
        qrImg = createCanvasImage(canvas)
        if (qrImg) {
          await new Promise<void>((resolve, reject) => {
            qrImg.onload = () => resolve()
            qrImg.onerror = () => reject(new Error('二维码加载失败'))
            qrImg.src = downloadedPath
          })
        }
      } catch {
        // fallback to placeholder
      }
    }

    const userAvatarSrc = avatarUrl || defaultAvatar
    let avatarDownloadedPath = userAvatarSrc
    try {
      if (userAvatarSrc.startsWith('http')) {
        avatarDownloadedPath = await downloadImage(userAvatarSrc)
      }
    } catch {
      avatarDownloadedPath = defaultAvatar
    }

    const avatarImg = createCanvasImage(canvas)
    if (avatarImg) {
      await new Promise<void>((resolve) => {
        avatarImg.onload = () => resolve()
        avatarImg.onerror = () => resolve()
        avatarImg.src = avatarDownloadedPath
      })
    }

    drawBackground(ctx)

    if (avatarImg) {
      drawHeaderContent(ctx, avatarImg, nickname)
    } else {
      drawHeaderTextOnly(ctx, nickname)
    }

    drawInviteInfo(ctx, inviteCode)

    if (qrImg) {
      drawQRCode(ctx, qrImg)
    } else {
      drawQRPlaceholder(ctx, inviteCode)
    }

    drawFooter(ctx)

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        Taro.canvasToTempFilePath({
          canvas,
          success: (res) => {
            setPosterUrl(res.tempFilePath)
            setGenerating(false)
            resolve()
          },
          fail: (err) => {
            logger.error('导出海报失败:', err)
            setGenerating(false)
            resolve()
          },
        })
      }, 300)
    })
  }

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    // 主背景 - 浅灰绿色，更高级柔和
    ctx.fillStyle = '#F5F7F5'
    ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT)

    // 顶部绿色装饰带 - 使用主题色
    const headerGradient = ctx.createLinearGradient(0, 0, POSTER_WIDTH, 0)
    headerGradient.addColorStop(0, '#22C55E')
    headerGradient.addColorStop(0.5, '#16A34A')
    headerGradient.addColorStop(1, '#22C55E')
    ctx.fillStyle = headerGradient
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(POSTER_WIDTH, 0)
    ctx.lineTo(POSTER_WIDTH, 200)
    ctx.quadraticCurveTo(POSTER_WIDTH / 2, 240, 0, 200)
    ctx.closePath()
    ctx.fill()

    // 装饰圆点 - 更柔和的绿色
    ctx.fillStyle = 'rgba(34, 197, 94, 0.06)'
    ctx.beginPath()
    ctx.arc(POSTER_WIDTH * 0.85, POSTER_HEIGHT * 0.15, 120, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(34, 197, 94, 0.04)'
    ctx.beginPath()
    ctx.arc(POSTER_WIDTH * 0.12, POSTER_HEIGHT * 0.85, 100, 0, Math.PI * 2)
    ctx.fill()

    // 顶部装饰线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(60, 170)
    ctx.lineTo(POSTER_WIDTH - 60, 170)
    ctx.stroke()
  }

  const drawHeaderContent = (
    ctx: CanvasRenderingContext2D,
    avatarImg: any,
    name?: string
  ) => {
    const avatarSize = 90
    const avatarX = POSTER_WIDTH / 2 - avatarSize / 2
    const avatarY = 55

    // 头像外圈光晕
    ctx.save()
    ctx.beginPath()
    ctx.arc(POSTER_WIDTH / 2, avatarY + avatarSize / 2, avatarSize / 2 + 6, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.fill()
    ctx.restore()

    // 头像白边
    ctx.save()
    ctx.beginPath()
    ctx.arc(POSTER_WIDTH / 2, avatarY + avatarSize / 2, avatarSize / 2 + 3, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.fill()
    ctx.restore()

    // 头像
    ctx.save()
    ctx.beginPath()
    ctx.arc(POSTER_WIDTH / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize)
    ctx.restore()

    // 昵称文字
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 30px sans-serif'
    ctx.textAlign = 'center'
    const displayName = name?.length ? `${name}` : '我'
    ctx.fillText(`${displayName} 邀请你加入`, POSTER_WIDTH / 2, avatarY + avatarSize + 45)

    // 副标题
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.font = '22px sans-serif'
    ctx.fillText('一键回收 · 让闲置物品重获新生', POSTER_WIDTH / 2, avatarY + avatarSize + 78)
  }

  const drawHeaderTextOnly = (ctx: CanvasRenderingContext2D, name?: string) => {
    const centerY = 110

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 36px sans-serif'
    ctx.textAlign = 'center'
    const displayName = name?.length ? `${name}` : '我'
    ctx.fillText(`${displayName} 邀请你加入`, POSTER_WIDTH / 2, centerY)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.font = '22px sans-serif'
    ctx.fillText('一键回收 · 让闲置物品重获新生', POSTER_WIDTH / 2, centerY + 38)
  }

  const drawInviteInfo = (ctx: CanvasRenderingContext2D, code: string) => {
    const cardY = 240
    const cardHeight = 560
    const cardPadding = 30

    // 卡片阴影
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
    ctx.shadowBlur = 30
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 8
    roundRect(ctx, 24, cardY, POSTER_WIDTH - 48, cardHeight, 20)
    ctx.restore()

    // 卡片背景
    roundRect(ctx, 24, cardY, POSTER_WIDTH - 48, cardHeight, 20)

    // 顶部绿色条
    ctx.fillStyle = '#2E7D32'
    ctx.beginPath()
    ctx.moveTo(24, cardY)
    ctx.lineTo(POSTER_WIDTH - 24, cardY)
    ctx.lineTo(POSTER_WIDTH - 24, cardY + 6)
    ctx.lineTo(24, cardY + 6)
    ctx.closePath()
    ctx.fill()

    // 标题
    ctx.fillStyle = '#1B5E20'
    ctx.font = 'bold 34px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('扫码立即参与', POSTER_WIDTH / 2, cardY + 65)

    // 副标题
    ctx.fillStyle = '#888888'
    ctx.font = '22px sans-serif'
    ctx.fillText('好友下单 · 双方得积分奖励', POSTER_WIDTH / 2, cardY + 100)

    // 虚线分隔
    ctx.strokeStyle = '#E8F5E9'
    ctx.lineWidth = 1.5
    ctx.setLineDash([8, 5])
    ctx.beginPath()
    ctx.moveTo(cardPadding + 20, cardY + 130)
    ctx.lineTo(POSTER_WIDTH - 20 - cardPadding, cardY + 130)
    ctx.stroke()
    ctx.setLineDash([])

    // 邀请码标签
    ctx.fillStyle = '#666666'
    ctx.font = '22px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('我的邀请码', POSTER_WIDTH / 2, cardY + 175)

    // 邀请码背景
    ctx.save()
    ctx.fillStyle = '#F1F8E9'
    roundRect(ctx, POSTER_WIDTH / 2 - 160, cardY + 195, 320, 60, 12)
    ctx.restore()

    // 邀请码
    ctx.fillStyle = '#1B5E20'
    ctx.font = 'bold 42px sans-serif'
    const codeDisplay = code.match(/.{1,4}/g)?.join('  ') || code
    ctx.fillText(codeDisplay.toUpperCase(), POSTER_WIDTH / 2, cardY + 238)

    // 提示文字
    ctx.fillStyle = '#999999'
    ctx.font = '18px sans-serif'
    ctx.fillText('长按识别二维码或输入邀请码', POSTER_WIDTH / 2, cardY + 290)
  }

  const drawQRCode = (ctx: CanvasRenderingContext2D, qrImg: any) => {
    const qrSize = 240
    const qrX = POSTER_WIDTH / 2 - qrSize / 2
    const qrY = 520

    // 二维码背景卡片
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)'
    ctx.shadowBlur = 20
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 4
    roundRect(ctx, qrX - 18, qrY - 18, qrSize + 36, qrSize + 36, 16)
    ctx.restore()

    // 二维码
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

    // 底部提示
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('微信扫一扫 · 立即注册', POSTER_WIDTH / 2, qrY + qrSize + 55)
  }

  const drawQRPlaceholder = (ctx: CanvasRenderingContext2D, code: string) => {
    const qrSize = 240
    const qrX = POSTER_WIDTH / 2 - qrSize / 2
    const qrY = 520

    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)'
    ctx.shadowBlur = 20
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 4
    roundRect(ctx, qrX - 18, qrY - 18, qrSize + 36, qrSize + 36, 16)
    ctx.restore()

    ctx.fillStyle = '#F5F5F5'
    ctx.fillRect(qrX, qrY, qrSize, qrSize)

    ctx.fillStyle = '#D1D5DB'
    ctx.font = '20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('二维码区域', POSTER_WIDTH / 2, qrY + qrSize / 2 - 10)

    ctx.font = '18px sans-serif'
    ctx.fillText(`邀请码: ${code}`, POSTER_WIDTH / 2, qrY + qrSize / 2 + 25)

    ctx.fillStyle = '#9CA3AF'
    ctx.font = '18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('微信扫一扫 · 立即注册', POSTER_WIDTH / 2, qrY + qrSize + 55)
  }

  const drawFooter = (ctx: CanvasRenderingContext2D) => {
    // 底部装饰线
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(60, POSTER_HEIGHT - 90)
    ctx.lineTo(POSTER_WIDTH - 60, POSTER_HEIGHT - 90)
    ctx.stroke()

    ctx.fillStyle = '#6B7280'
    ctx.font = '20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('环保回收 · 积分兑换 · 便捷上门', POSTER_WIDTH / 2, POSTER_HEIGHT - 55)

    ctx.fillStyle = '#9CA3AF'
    ctx.font = '16px sans-serif'
    ctx.fillText('一键回收小程序', POSTER_WIDTH / 2, POSTER_HEIGHT - 28)
  }

  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
  }

  const handleSaveToAlbum = async () => {
    if (!posterUrl) return

    try {
      const setting = await Taro.getSetting()
      if (!setting.authSetting['scope.writePhotosAlbum']) {
        try {
          await Taro.authorize({ scope: 'scope.writePhotosAlbum' })
        } catch {
          Taro.showModal({
            title: '提示',
            content: '需要您授权保存相册权限才能保存海报',
            confirmText: '去设置',
            success: (modalRes) => {
              if (modalRes.confirm) {
                Taro.openSetting()
              }
            },
          })
          return
        }
      }

      Taro.saveImageToPhotosAlbum({
        filePath: posterUrl,
        success: () => {
          Taro.showToast({ title: '保存成功', icon: 'success' })
        },
        fail: (err) => {
          if (err.errMsg?.includes('auth deny')) {
            Taro.showModal({
              title: '提示',
              content: '需要您授权保存相册权限',
              confirmText: '去设置',
              success: (res) => {
                if (res.confirm) {
                  Taro.openSetting()
                }
              },
            })
          } else {
            Taro.showToast({ title: '保存失败', icon: 'error' })
          }
        },
      })
    } catch (error) {
      logger.error('保存海报失败:', error)
      Taro.showToast({ title: '保存失败', icon: 'error' })
    }
  }

  const handlePreview = () => {
    if (!posterUrl) return
    Taro.previewImage({
      current: posterUrl,
      urls: [posterUrl],
    })
  }

  const handleSharePoster = () => {
    if (!posterUrl) return
    Taro.showShareImageMenu({
      path: posterUrl,
      success: () => {
        logger.info('分享海报成功')
      },
      fail: (err) => {
        logger.error('分享海报失败:', err)
      },
    })
  }

  if (!visible) return null

  return (
    <View className="poster-mask" onClick={onClose}>
      <View className="poster-container" onClick={(e) => e.stopPropagation()}>
        <View className="poster-header">
          <Text className="poster-title">邀请海报</Text>
          <View className="poster-close" onClick={onClose}>
            <Text>✕</Text>
          </View>
        </View>

        <View className="poster-content">
          {generating && (
            <View className="poster-loading">
              <View className="loading-spinner" />
              <Text className="loading-text">正在生成海报...</Text>
            </View>
          )}

          {posterUrl ? (
            <View className="poster-image-wrapper">
              <Image
                className="poster-image"
                src={posterUrl}
                mode="widthFix"
                onClick={handlePreview}
              />
              <Text className="poster-tip">点击海报可预览</Text>
            </View>
          ) : null}

          <Canvas
            id={CANVAS_ID}
            type="2d"
            className="poster-canvas"
            style={{ width: `${POSTER_WIDTH}px`, height: `${POSTER_HEIGHT}px` }}
          />
        </View>

        <View className="poster-actions">
          <Button
            className="save-btn"
            disabled={!posterUrl || generating}
            onClick={handleSaveToAlbum}
          >
            保存到相册
          </Button>
          <Button
            className="share-poster-btn"
            disabled={!posterUrl || generating}
            onClick={handleSharePoster}
          >
            分享海报
          </Button>
        </View>
      </View>
    </View>
  )
}

export default InvitePoster
