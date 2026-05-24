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
const POSTER_HEIGHT = 900
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
    const gradient = ctx.createLinearGradient(0, 0, 0, POSTER_HEIGHT)
    gradient.addColorStop(0, '#1B5E20')
    gradient.addColorStop(0.4, '#2E7D32')
    gradient.addColorStop(0.7, '#388E3C')
    gradient.addColorStop(1, '#43A047')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.beginPath()
    ctx.arc(POSTER_WIDTH * 0.8, POSTER_HEIGHT * 0.15, 120, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.beginPath()
    ctx.arc(POSTER_WIDTH * 0.15, POSTER_HEIGHT * 0.85, 100, 0, Math.PI * 2)
    ctx.fill()
  }

  const drawHeaderContent = (
    ctx: CanvasRenderingContext2D,
    avatarImg: any,
    name?: string
  ) => {
    const avatarSize = 80
    const avatarX = POSTER_WIDTH / 2 - avatarSize / 2
    const avatarY = 60

    ctx.save()
    ctx.beginPath()
    ctx.arc(POSTER_WIDTH / 2, avatarY + avatarSize / 2, avatarSize / 2 + 4, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.fill()
    ctx.restore()

    ctx.save()
    ctx.beginPath()
    ctx.arc(POSTER_WIDTH / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize)
    ctx.restore()

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(name?.length ? `${name} 邀请你加入` : '邀请你一起环保回收', POSTER_WIDTH / 2, avatarY + avatarSize + 40)
  }

  const drawHeaderTextOnly = (ctx: CanvasRenderingContext2D, name?: string) => {
    const centerY = 100

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 32px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(name?.length ? `${name} 邀请你加入` : '邀请你一起环保回收', POSTER_WIDTH / 2, centerY)
  }

  const drawInviteInfo = (ctx: CanvasRenderingContext2D, code: string) => {
    const cardY = 200
    const cardHeight = 520
    const cardPadding = 30

    roundRect(ctx, 20, cardY, POSTER_WIDTH - 40, cardHeight, 16)

    ctx.fillStyle = '#1B5E20'
    ctx.font = 'bold 32px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('扫码立即参与', POSTER_WIDTH / 2, cardY + 50)

    ctx.fillStyle = '#666666'
    ctx.font = '24px sans-serif'
    ctx.fillText('好友下单 · 双方得积分奖励', POSTER_WIDTH / 2, cardY + 85)

    ctx.strokeStyle = '#E8F5E9'
    ctx.lineWidth = 1
    ctx.setLineDash([6, 4])
    ctx.beginPath()
    ctx.moveTo(cardY + cardPadding, cardY + 110)
    ctx.lineTo(POSTER_WIDTH - 20 - cardPadding, cardY + 110)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = '#333333'
    ctx.font = '22px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('邀请码', POSTER_WIDTH / 2, cardY + 155)

    ctx.fillStyle = '#1B5E20'
    ctx.font = 'bold 48px sans-serif'
    const codeDisplay = code.match(/.{1,4}/g)?.join('  ') || code
    ctx.fillText(codeDisplay.toUpperCase(), POSTER_WIDTH / 2, cardY + 210)
  }

  const drawQRCode = (ctx: CanvasRenderingContext2D, qrImg: any) => {
    const qrSize = 220
    const qrX = POSTER_WIDTH / 2 - qrSize / 2
    const qrY = 430

    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
    ctx.shadowBlur = 20
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 4
    roundRect(ctx, qrX - 15, qrY - 15, qrSize + 30, qrSize + 30, 12)
    ctx.restore()

    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

    ctx.fillStyle = '#999999'
    ctx.font = '18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('微信扫一扫 · 立即注册', POSTER_WIDTH / 2, qrY + qrSize + 40)
  }

  const drawQRPlaceholder = (ctx: CanvasRenderingContext2D, code: string) => {
    const qrSize = 220
    const qrX = POSTER_WIDTH / 2 - qrSize / 2
    const qrY = 430

    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
    ctx.shadowBlur = 20
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 4
    roundRect(ctx, qrX - 15, qrY - 15, qrSize + 30, qrSize + 30, 12)
    ctx.restore()

    ctx.fillStyle = '#F5F5F5'
    ctx.fillRect(qrX, qrY, qrSize, qrSize)

    ctx.fillStyle = '#CCCCCC'
    ctx.font = '20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('二维码区域', POSTER_WIDTH / 2, qrY + qrSize / 2 - 10)

    ctx.font = '18px sans-serif'
    ctx.fillText(`邀请码: ${code}`, POSTER_WIDTH / 2, qrY + qrSize / 2 + 25)

    ctx.fillStyle = '#999999'
    ctx.font = '18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('微信扫一扫 · 立即注册', POSTER_WIDTH / 2, qrY + qrSize + 40)
  }

  const drawFooter = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#FFFFFF'
    ctx.globalAlpha = 0.9
    ctx.font = '18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('一键回收 · 让闲置物品重获新生', POSTER_WIDTH / 2, POSTER_HEIGHT - 50)
    ctx.globalAlpha = 1
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
            open-type="share"
            disabled={!posterUrl || generating}
          >
            分享给好友
          </Button>
        </View>
      </View>
    </View>
  )
}

export default InvitePoster
