import Taro from '@tarojs/taro'

export interface UploadResponse {
  success: boolean
  data?: {
    url: string
    filename: string
    size: number
  }
  message?: string
}
const baseUrl = process.env.TARO_APP_API_BASE_URL || 'http://localhost:3000';
/**
 * 上传图片到服务器
 * @param filePath 本地文件路径
 * @returns 上传结果
 */
export const uploadImage = async (filePath: string): Promise<UploadResponse> => {
  try {
    const uploadResult = await Taro.uploadFile({
      url: `${baseUrl}/api/upload/image`,
      filePath,
      name: 'image',
      header: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (uploadResult.statusCode === 200) {
      const data = JSON.parse(uploadResult.data)
      return {
        success: true,
        data: {
          url: data.url,
          filename: data.filename,
          size: data.size
        }
      }
    } else {
      return {
        success: false,
        message: '上传失败'
      }
    }
  } catch (error) {
    console.error('上传图片失败:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '上传失败'
    }
  }
}

/**
 * 上传头像
 * @param filePath 本地文件路径
 * @returns 上传结果
 */
export const uploadAvatar = async (filePath: string): Promise<UploadResponse> => {
  try {
    const uploadResult = await Taro.uploadFile({
      url: `${baseUrl}/api/upload/avatar`,
      filePath,
      name: 'avatar',
      header: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (uploadResult.statusCode === 200) {
      const data = JSON.parse(uploadResult.data)
      return {
        success: true,
        data: {
          url: data.url,
          filename: data.filename,
          size: data.size
        }
      }
    } else {
      return {
        success: false,
        message: '头像上传失败'
      }
    }
  } catch (error) {
    console.error('上传头像失败:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '头像上传失败'
    }
  }
}