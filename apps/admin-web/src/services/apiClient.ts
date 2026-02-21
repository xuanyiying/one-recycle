import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  AxiosRequestConfig,
} from 'axios';
import { toast } from '@/components/ui/toast';

// API base URLs from environment variables
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3008';

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
  details?: unknown;
}

// 请求配置接口
export interface RequestConfig extends AxiosRequestConfig {
  showLoading?: boolean;
  showError?: boolean;
  showSuccess?: boolean;
  successMessage?: string;
}

export class ApiClient {
  private instance: AxiosInstance;

  constructor(baseURL: string, serviceName?: string) {
    let fullBaseURL = baseURL;
    if (serviceName) {
      fullBaseURL = `${baseURL}/api`;
    }

    this.instance = axios.create({
      baseURL: fullBaseURL,
      timeout: 15000, // Reduced to 15s for quicker feedback
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors(serviceName);
  }

  private setupInterceptors(serviceName?: string) {
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['X-Request-ID'] = this.generateRequestId();

        // Use debug log instead of console.log in production
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${serviceName || 'API'}] Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

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

  private getAuthToken(): string | null {
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

  private handleUnauthorized() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
    }
  }

  getInstance(): AxiosInstance {
    return this.instance;
  }

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
      
      if (resp.success === false) {
        const errorMessage = resp.error?.message || resp.message || '请求失败';
        const errorCode = resp.error?.code || resp.code || 'API_ERROR';
        const error: any = new Error(errorMessage);
        error.code = errorCode;
        error.details = resp.error?.details;
        throw error;
      }
      
      if ('data' in resp) {
        return resp.data as T;
      }
    }
    return responseData as unknown as T;
  }

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

  async upload<T = any>(url: string, data: FormData, config?: RequestConfig): Promise<T> {
    try {
      const requestConfig = { ...config, headers: { 'Content-Type': 'multipart/form-data' } };
      const response = await this.instance.post<ApiResponse<T>>(
        url,
        data,
        requestConfig,
      );
      if (config?.showSuccess && config?.successMessage) {
        toast.success(config.successMessage);
      }
      return this.unwrapResponseData<T>(response.data);
    } catch (error) {
      throw error;
    }
  }

}

export const apiClient = new ApiClient(API_BASE_URL, 'Main');
