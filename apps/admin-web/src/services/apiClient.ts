import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';

// API base URLs from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3008';

// 通用响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

// 分页响应接口
export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 错误响应接口
export interface ApiError {
  message: string;
  code?: number;
  details?: any;
}

// 请求配置接口
export interface RequestConfig {
  showLoading?: boolean;
  showError?: boolean;
  showSuccess?: boolean;
  successMessage?: string;
}

export class ApiClient {
  private instance: AxiosInstance;
  private loadingCount = 0;

  constructor(baseURL: string, serviceName?: string) {
    // 为不同服务添加正确的API路径前缀
    let fullBaseURL = baseURL;
    if (serviceName) {
      fullBaseURL = `${baseURL}/api`;
    }

    this.instance = axios.create({
      baseURL: fullBaseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors(serviceName);
  }

  private setupInterceptors(serviceName?: string) {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 添加认证token
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 添加请求ID用于追踪
        config.headers['X-Request-ID'] = this.generateRequestId();

        // 日志记录
        console.log(
          `[${serviceName || 'API'}] 发送请求: ${config.method?.toUpperCase()} ${config.url}`,
        );

        return config;
      },
      (error) => {
        console.error(`[${serviceName || 'API'}] 请求拦截器错误:`, error);
        return Promise.reject(error);
      },
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(
          `[${serviceName || 'API'}] 收到响应: ${response.status} ${response.config.url}`,
        );
        return response;
      },
      (error: AxiosError) => {
        console.error(
          `[${serviceName || 'API'}] 响应错误:`,
          error.response?.status,
          error.config?.url,
          error.message,
        );

        // 统一错误处理
        this.handleError(error);

        return Promise.reject(error);
      },
    );
  }

  private getAuthToken(): string | null {
    // 从localStorage或其他存储中获取token
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleError(error: AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data as any;

    switch (status) {
      case 401:
        message.error('认证失败，请重新登录');
        // 可以在这里触发登出逻辑
        this.handleUnauthorized();
        break;
      case 403:
        message.error('权限不足，无法访问该资源');
        break;
      case 404:
        message.error('请求的资源不存在');
        break;
      case 422:
        message.error(data?.message || '请求参数验证失败');
        break;
      case 429:
        message.error('请求过于频繁，请稍后再试');
        break;
      case 500:
        message.error('服务器内部错误，请稍后再试');
        break;
      case 502:
      case 503:
      case 504:
        message.error('服务暂时不可用，请稍后再试');
        break;
      default:
        if (error.code === 'ECONNABORTED') {
          message.error('请求超时，请检查网络连接');
        } else if (error.message === 'Network Error') {
          message.error('网络连接失败，请检查网络设置');
        } else {
          message.error(data?.message || '请求失败，请稍后再试');
        }
    }
  }

  private handleUnauthorized() {
    // 清除认证信息
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      // 可以重定向到登录页面
      // window.location.href = '/login';
    }
  }

  // GET请求
  async get<T = any>(url: string, params?: any, config?: RequestConfig): Promise<T> {
    try {
      const response = await this.instance.get<ApiResponse<T>>(url, { params });

      if (config?.showSuccess && config?.successMessage) {
        message.success(config.successMessage);
      }

      // 处理不同的响应格式
      const responseData = response.data;
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return (responseData as ApiResponse<T>).data;
      }
      return responseData as T;
    } catch (error) {
      if (config?.showError !== false) {
        // 错误已在拦截器中处理
      }
      throw error;
    }
  }

  // POST请求
  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    try {
      const response = await this.instance.post<ApiResponse<T>>(url, data);

      if (config?.showSuccess && config?.successMessage) {
        message.success(config.successMessage);
      }

      // 处理不同的响应格式
      const responseData = response.data;
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return (responseData as ApiResponse<T>).data;
      }
      return responseData as T;
    } catch (error) {
      if (config?.showError !== false) {
        // 错误已在拦截器中处理
      }
      throw error;
    }
  }

  // PUT请求
  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    try {
      const response = await this.instance.put<ApiResponse<T>>(url, data);

      if (config?.showSuccess && config?.successMessage) {
        message.success(config.successMessage);
      }

      // 处理不同的响应格式
      const responseData = response.data;
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return (responseData as ApiResponse<T>).data;
      }
      return responseData as T;
    } catch (error) {
      if (config?.showError !== false) {
        // 错误已在拦截器中处理
      }
      throw error;
    }
  }

  // DELETE请求
  async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    try {
      const response = await this.instance.delete<ApiResponse<T>>(url);

      if (config?.showSuccess && config?.successMessage) {
        message.success(config.successMessage);
      }

      // 处理不同的响应格式
      const responseData = response.data;
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return (responseData as ApiResponse<T>).data;
      }
      return responseData as T;
    } catch (error) {
      if (config?.showError !== false) {
        // 错误已在拦截器中处理
      }
      throw error;
    }
  }

  // PATCH请求
  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    try {
      const response = await this.instance.patch<ApiResponse<T>>(url, data);

      if (config?.showSuccess && config?.successMessage) {
        message.success(config.successMessage);
      }

      // 处理不同的响应格式
      const responseData = response.data;
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return (responseData as ApiResponse<T>).data;
      }
      return responseData as T;
    } catch (error) {
      if (config?.showError !== false) {
        // 错误已在拦截器中处理
      }
      throw error;
    }
  }

  // 获取原始axios实例（用于特殊需求）
  getInstance(): AxiosInstance {
    return this.instance;
  }
}
// 导出默认客户端
const apiClient = new ApiClient(API_BASE_URL);

// 导出用户服务专用客户端
export const userApiClient = new ApiClient(API_BASE_URL, 'user-service');

export default apiClient;
