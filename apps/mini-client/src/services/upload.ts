import { logger } from '@/utils/logger'
import Taro from '@tarojs/taro'
import { API_BASE_URL, post } from '../utils/request'
import { Storage } from '../utils/storage'
import { AuthService } from './auth'

export interface UploadResponse {
  success: boolean
  data?: {
    url: string
    filename: string
    size: number
  }
  message?: string
}
interface StorageUploadFile {
  id: string
  fileUrl: string
  filePath: string
  filename: string
  originalName: string
  fileSize: number
  mimeType: string
  hashMd5: string
  fileType: string
  category?: string
  thumbnailUrl?: string
  ossType: string
}

interface StorageBatchUploadResponse {
  success: StorageUploadFile[]
  errors: Array<{ index: number; filename: string; error: string }>
  total: number
  successCount: number
  errorCount: number
}

const baseUrl = API_BASE_URL

interface AliyunPostPolicyResponse {
  host: string
  policy: string
  signature: string
  accessKeyId: string
  securityToken?: string
  key: string
  bucket: string
  expireAt: string
  uploadSessionId: string
  ossType: string
}
/**
 * 上传图片到服务器
 * @param filePath 本地文件路径
 * @returns 上传结果
 */
export const uploadImage = async (filePath: string): Promise<UploadResponse> => {
  try {
    const token = Storage.getToken() || ''
    const uploadResult = await Taro.uploadFile({
      url: `${baseUrl}/storage/upload`,
      filePath,
      name: 'file',
      formData: { fileType: 'IMAGE', category: 'USER_UPLOAD' },
      header: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
    })

    if (uploadResult.statusCode === 401) {
      const refreshResult = await AuthService.refreshToken()
      const newToken = refreshResult.success ? refreshResult.token : null
      if (newToken) {
        const retryResult = await Taro.uploadFile({
          url: `${baseUrl}/storage/upload`,
          filePath,
          name: 'file',
          formData: { fileType: 'IMAGE', category: 'USER_UPLOAD' },
          header: {
            Authorization: `Bearer ${newToken}`,
          }
        })
        if (retryResult.statusCode === 200) {
          const parsed = JSON.parse(retryResult.data)
          const data = parsed.data || parsed;
          return {
            success: true,
            data: {
              url: data.fileUrl || data.url,
              filename: data.filename,
              size: data.fileSize || data.size
            }
          }
        }
      }
      return { success: false, message: '未授权或会话已过期' }
    }

    if (uploadResult.statusCode === 200) {
      const parsed = JSON.parse(uploadResult.data)
      const data = parsed.data || parsed;
      return {
        success: true,
        data: {
          url: data.fileUrl || data.url,
          filename: data.filename,
          size: data.fileSize || data.size
        }
      }
    } else {
      return {
        success: false,
        message: '上传失败'
      }
    }
  } catch (error) {
    logger.error('上传图片失败:', error)
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
    const token = Storage.getToken() || ''
    const uploadResult = await Taro.uploadFile({
      url: `${baseUrl}/storage/upload`,
      filePath,
      name: 'file',
      formData: { fileType: 'IMAGE', category: 'AVATAR' },
      header: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
    })

    if (uploadResult.statusCode === 401) {
      const refreshResult = await AuthService.refreshToken()
      const newToken = refreshResult.success ? refreshResult.token : null
      if (newToken) {
        const retryResult = await Taro.uploadFile({
          url: `${baseUrl}/storage/upload`,
          filePath,
          name: 'file',
          formData: { fileType: 'IMAGE', category: 'AVATAR' },
          header: {
            Authorization: `Bearer ${newToken}`,
          }
        })
        if (retryResult.statusCode === 200) {
          const parsed = JSON.parse(retryResult.data)
          const data = parsed.data || parsed;
          return {
            success: true,
            data: {
              url: data.fileUrl || data.url,
              filename: data.filename,
              size: data.fileSize || data.size
            }
          }
        }
      }
      return { success: false, message: '未授权或会话已过期' }
    }

    if (uploadResult.statusCode === 200) {
      const parsed = JSON.parse(uploadResult.data)
      const data = parsed.data || parsed;
      return {
        success: true,
        data: {
          url: data.fileUrl || data.url,
          filename: data.filename,
          size: data.fileSize || data.size
        }
      }
    } else {
      return {
        success: false,
        message: '头像上传失败'
      }
    }
  } catch (error) {
    logger.error('上传头像失败:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '头像上传失败'
    }
  }
}

export const uploadOrderPhotos = async (filePaths: string[]): Promise<string[]> => {
  if (!filePaths || filePaths.length === 0) return []

  const unwrapResponse = <T>(payload: any): T => {
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      if (payload.success === false) {
        throw new Error(payload.message || '请求失败')
      }
      return payload.data as T
    }
    return payload as T
  }

  const extensionContentTypeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    heic: 'image/heic',
    svg: 'image/svg+xml',
  }

  const getFileName = (filePath: string) => {
    const parts = filePath.split('/')
    return parts[parts.length - 1] || 'image'
  }

  const getContentType = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    return extensionContentTypeMap[ext] || 'application/octet-stream'
  }

  const uploadViaAliyunPostPolicy = async (filePath: string): Promise<string> => {
    const fileName = getFileName(filePath)
    const fileInfo = await Taro.getFileInfo({ filePath })
    if (!('size' in fileInfo)) {
      throw new Error('无法获取文件大小')
    }
    const contentType = getContentType(fileName)

    const policyResponse = await post<AliyunPostPolicyResponse>(
      '/storage/direct-upload/aliyun/post-policy',
      {
        fileName,
        fileSize: fileInfo.size,
        contentType,
        fileType: 'IMAGE',
        category: 'ORDER_PHOTO',
      }
    )
    const policy = unwrapResponse<AliyunPostPolicyResponse>(policyResponse)

    const formData: Record<string, string> = {
      key: policy.key,
      policy: policy.policy,
      OSSAccessKeyId: policy.accessKeyId,
      signature: policy.signature,
      success_action_status: '200',
    }

    if (policy.securityToken) {
      formData['x-oss-security-token'] = policy.securityToken
    }

    const uploadResult = await Taro.uploadFile({
      url: policy.host,
      filePath,
      name: 'file',
      formData,
    })

    if (uploadResult.statusCode !== 200 && uploadResult.statusCode !== 204) {
      throw new Error('照片上传失败')
    }

    const confirmResponse = await post<{ fileId: string }>(
      '/storage/direct-upload/confirm',
      {
        uploadSessionId: policy.uploadSessionId,
        actualFileSize: fileInfo.size,
      }
    )

    const confirm = unwrapResponse<{ fileId: string }>(confirmResponse)
    return confirm.fileId
  }

  const uploadViaServer = async (filePath: string): Promise<string> => {
    const currentToken = Storage.getToken() || ''

    const doServerUpload = async (authToken: string) => {
      const uploadResult = await Taro.uploadFile({
        url: `${baseUrl}/storage/upload-batch`,
        filePath,
        name: 'files',
        header: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        formData: {
          fileType: 'IMAGE',
          category: 'ORDER_PHOTO',
        },
      })

      if (uploadResult.statusCode === 401) {
        throw { statusCode: 401, isAuthError: true }
      }

      if (uploadResult.statusCode < 200 || uploadResult.statusCode >= 300) {
        throw new Error('照片上传失败')
      }

      const raw = JSON.parse(uploadResult.data)
      const data = unwrapResponse<StorageBatchUploadResponse>(raw)
      const successList = data.success || []

      if (!Array.isArray(successList) || successList.length === 0) {
        const message = data.errors?.[0]?.error || '照片上传失败'
        throw new Error(message)
      }

      const first = successList[0]
      if (!first?.id) {
        throw new Error('照片上传失败')
      }
      return first.id
    }

    try {
      return await doServerUpload(currentToken)
    } catch (error: any) {
      if (error && error.isAuthError) {
        const refreshResult = await AuthService.refreshToken()
        const newToken = refreshResult.success ? refreshResult.token : null
        if (newToken) {
          return await doServerUpload(newToken)
        }
        throw new Error('未授权或会话已过期')
      }
      throw error
    }
  }

  const uploadSingle = async (filePath: string): Promise<string> => {
    try {
      return await uploadViaAliyunPostPolicy(filePath)
    } catch (error) {
      return uploadViaServer(filePath)
    }
  }

  const results = await Promise.all(filePaths.map((filePath) => uploadSingle(filePath)))
  return results
}
