import { toast } from '@/components/ui/toast';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

/**
 * API客户端配置
 * 用于管理后台系统的API请求
 * 支持请求拦截、响应处理、错误处理等功能
 */

// API基础URL配置 - 从环境变量读取，默认本地开发地址
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3008';

/**
 * 通用API响应接口
 * @template T 响应数据类型
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

/**
 * 分页响应接口
 * @template T 列表项数据类型
 */
export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * API错误响应接口
 */
export interface ApiError {
  message: string;
  code?: number;
  details?: unknown;
}

/**
 * 请求配置扩展接口
 * 继承自AxiosRequestConfig，添加自定义选项
 */
export interface RequestConfig extends AxiosRequestConfig {
  showLoading?: boolean;    // 是否显示加载状态
  showError?: boolean;      // 是否显示错误提示
  showSuccess?: boolean;    // 是否显示成功提示
  successMessage?: string;  // 自定义成功消息
}

/**
 * API客户端类
 * 封装axios实例，提供统一的HTTP请求方法
 */
export class ApiClient {
  private instance: AxiosInstance;

  /**
   * 创建API客户端实例
   * @param baseURL - API基础URL
   * @param serviceName - 服务名称（用于日志标识）
   */
  constructor(baseURL: string, serviceName?: string) {
    let fullBaseURL = baseURL;
    if (serviceName) {
      fullBaseURL = `${baseURL}/api`;
    }

    // 创建axios实例
    this.instance = axios.create({
      baseURL: fullBaseURL,
      timeout: 15000, // 请求超时时间15秒
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 设置请求和响应拦截器
    this.setupInterceptors(serviceName);
  }

  /**
   * 设置请求和响应拦截器
   * @param serviceName - 服务名称
   */
  private setupInterceptors(serviceName?: string) {
    // 请求拦截器 - 添加认证token和请求ID
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['X-Request-ID'] = this.generateRequestId();

        // 开发环境打印请求日志
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${serviceName || 'API'}] Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器 - 处理响应和错误
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${serviceName || 'API'}] Response: ${response.status} ${response.config.url}`);
        }
        return response;
      },
      (error: AxiosError) => {
        console.error(`[${serviceName || 'API'}] Error:`, error.message);
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 从localStorage获取认证token
   * @returns token字符串或null
   */
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * 生成唯一请求ID
   * 用于请求追踪和调试
   * @returns 请求ID字符串
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 统一错误处理
   * 根据HTTP状态码显示相应的错误提示
   * @param error - Axios错误对象
   */
  private handleError(error: AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data as { message?: string } | undefined;

    switch (status) {
      case 401:
        this.handleUnauthorized();
        break;
      case 403:
        toast.error('权限不足，无法访问该资源');
        break;
      case 404:
        toast.error('请求的资源不存在');
        break;
      case 422:
        toast.error(data?.message || '请求参数验证失败');
        break;
      case 429:
        toast.error('请求过于频繁，请稍后再试');
        break;
      case 500:
        toast.error('服务器内部错误，请稍后再试');
        break;
      case 502:
      case 503:
      case 504:
        toast.error('服务暂时不可用，请稍后再试');
        break;
      default:
        if (error.code === 'ECONNABORTED') {
          toast.error('请求超时，请检查网络连接');
        } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
          toast.error('无法连接到服务器，请检查网络设置或稍后再试');
        } else if (error.code === 'ECONNREFUSED') {
          toast.error('服务器拒绝连接，服务可能未启动');
        } else {
          toast.error(data?.message || '请求失败，请稍后再试');
        }
    }
  }

  /**
   * 处理401未授权错误
   * 清除本地存储的认证信息
   */
  private handleUnauthorized() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
      window.location.href = '/login';
    }
  }

  /**
   * 获取axios实例
   * @returns AxiosInstance
   */
  getInstance(): AxiosInstance {
    return this.instance;
  }

  /**
   * 解包响应数据
   * 处理后端返回的统一响应格式
   * @param responseData - 原始响应数据
   * @returns 解包后的数据
   */
  private unwrapResponseData<T>(responseData: unknown): T {
    if (
      responseData &&
      typeof responseData === 'object' &&
      'success' in (responseData as Record<string, unknown>)
    ) {
      const resp = responseData as {
        success: boolean;
        data?: T;
        message?: string;
        code?: string;
        error?: { code: string; message: string; details?: any };
      };

      // 处理业务逻辑错误
      if (resp.success === false) {
        const errorMessage = resp.error?.message || resp.message || '请求失败';
        const errorCode = resp.error?.code || resp.code || 'API_ERROR';
        const error: any = new Error(errorMessage);
        error.code = errorCode;
        error.details = resp.error?.details;
        throw error;
      }

      // 返回data字段
      if ('data' in resp) {
        return resp.data as T;
      }
    }
    return responseData as unknown as T;
  }

  /**
   * GET请求
   * @param url - 请求路径
   * @param params - URL参数
   * @param config - 请求配置
   * @returns Promise<T>
   */
  async get<T = any>(url: string, params?: any, config?: RequestConfig): Promise<T> {
    try {
      const requestConfig = { ...config, params };
      const response = await this.instance.get<ApiResponse<T>>(url, requestConfig);
      if (config?.showSuccess && config?.successMessage) {
        toast.success(config.successMessage);
      }
      return this.unwrapResponseData<T>(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST请求
   * @param url - 请求路径
   * @param data - 请求体数据
   * @param config - 请求配置
   * @returns Promise<T>
   */
  async post<T = any>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    try {
      const response = await this.instance.post<ApiResponse<T>>(url, data, config);
      if (config?.showSuccess && config?.successMessage) {
        toast.success(config.successMessage);
      }
      return this.unwrapResponseData<T>(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT请求
   * @param url - 请求路径
   * @param data - 请求体数据
   * @param config - 请求配置
   * @returns Promise<T>
   */
  async put<T = any>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    try {
      const response = await this.instance.put<ApiResponse<T>>(url, data, config);
      if (config?.showSuccess && config?.successMessage) {
        toast.success(config.successMessage);
      }
      return this.unwrapResponseData<T>(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * PATCH请求
   * @param url - 请求路径
   * @param data - 请求体数据
   * @param config - 请求配置
   * @returns Promise<T>
   */
  async patch<T = any>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    try {
      const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
      if (config?.showSuccess && config?.successMessage) {
        toast.success(config.successMessage);
      }
      return this.unwrapResponseData<T>(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE请求
   * @param url - 请求路径
   * @param data - 请求体数据
   * @param config - 请求配置
   * @returns Promise<T>
   */
  async delete<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    try {
      const requestConfig = { ...config, data };
      const response = await this.instance.delete<ApiResponse<T>>(url, requestConfig);
      if (config?.showSuccess && config?.successMessage) {
        toast.success(config.successMessage);
      }
      return this.unwrapResponseData<T>(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 文件上传请求
   * 使用multipart/form-data格式上传文件
   * @param url - 请求路径
   * @param formData - FormData对象
   * @param config - 请求配置
   * @returns Promise<T>
   */
  async upload<T = any>(url: string, formData: FormData, config?: RequestConfig): Promise<T> {
    try {
      const response = await this.instance.post<ApiResponse<T>>(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (config?.showSuccess && config?.successMessage) {
        toast.success(config.successMessage);
      }
      return this.unwrapResponseData<T>(response.data);
    } catch (error) {
      throw error;
    }
  }
}

// 创建默认API客户端实例
export const apiClient = new ApiClient(API_BASE_URL);

// 导出默认实例供直接使用
export default apiClient;
