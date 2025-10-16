import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { LoadBalancerService } from './load-balancer.service';
import { firstValueFrom, timeout, retry } from 'rxjs';
import { Request, Response } from 'express';

export interface ProxyOptions {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly loadBalancerService: LoadBalancerService,
  ) {}

  /**
   * 代理单个请求到指定服务
   */
  async proxyRequest(
    serviceName: string,
    path: string,
    method: string,
    body?: any,
    headers?: Record<string, string>,
    options?: ProxyOptions,
  ): Promise<any> {
    const serviceInstance = this.loadBalancerService.getServiceInstance(serviceName);
    
    if (!serviceInstance) {
      throw new HttpException(
        `Service ${serviceName} is not available`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const url = `${serviceInstance.baseUrl}${path}`;
    const requestOptions = {
      timeout: options?.timeout || serviceInstance.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...options?.headers,
      },
    };

    try {
      this.logger.debug(`Proxying ${method} request to: ${url}`);
      
      let response;
      const retries = options?.retries || serviceInstance.retries;

      switch (method.toUpperCase()) {
        case 'GET':
          response = await firstValueFrom(
            this.httpService.get(url, requestOptions).pipe(
              timeout(requestOptions.timeout),
              retry(retries),
            ),
          );
          break;
        case 'POST':
          response = await firstValueFrom(
            this.httpService.post(url, body, requestOptions).pipe(
              timeout(requestOptions.timeout),
              retry(retries),
            ),
          );
          break;
        case 'PUT':
          response = await firstValueFrom(
            this.httpService.put(url, body, requestOptions).pipe(
              timeout(requestOptions.timeout),
              retry(retries),
            ),
          );
          break;
        case 'DELETE':
          response = await firstValueFrom(
            this.httpService.delete(url, requestOptions).pipe(
              timeout(requestOptions.timeout),
              retry(retries),
            ),
          );
          break;
        case 'PATCH':
          response = await firstValueFrom(
            this.httpService.patch(url, body, requestOptions).pipe(
              timeout(requestOptions.timeout),
              retry(retries),
            ),
          );
          break;
        default:
          throw new HttpException(
            `Unsupported HTTP method: ${method}`,
            HttpStatus.METHOD_NOT_ALLOWED,
          );
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Proxy request failed for ${serviceName}: ${error.message}`);
      
      // 标记实例为不健康
      this.loadBalancerService.markInstanceUnhealthy(serviceName, serviceInstance.baseUrl);
      
      if (error.response) {
        throw new HttpException(
          error.response.data || error.message,
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      
      throw new HttpException(
        'Service temporarily unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * 聚合多个服务的响应
   */
  async aggregateRequests(requests: Array<{
    key: string;
    serviceName: string;
    path: string;
    method: string;
    body?: any;
    headers?: Record<string, string>;
    options?: ProxyOptions;
  }>): Promise<Record<string, any>> {
    const promises = requests.map(async (req) => {
      try {
        const result = await this.proxyRequest(
          req.serviceName,
          req.path,
          req.method,
          req.body,
          req.headers,
          req.options,
        );
        return { key: req.key, data: result, error: null };
      } catch (error) {
        this.logger.error(`Aggregation request failed for ${req.key}: ${error.message}`);
        return { key: req.key, data: null, error: error.message };
      }
    });

    const results = await Promise.all(promises);
    const aggregatedResponse: Record<string, any> = {};

    results.forEach(result => {
      aggregatedResponse[result.key] = {
        data: result.data,
        error: result.error,
      };
    });

    return aggregatedResponse;
  }

  /**
   * 流式代理 - 直接转发请求和响应
   */
  async streamProxy(
    req: Request,
    res: Response,
    serviceName: string,
    path: string,
  ): Promise<void> {
    const serviceInstance = this.loadBalancerService.getServiceInstance(serviceName);
    
    if (!serviceInstance) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        error: `Service ${serviceName} is not available`,
      });
      return;
    }

    const url = `${serviceInstance.baseUrl}${path}`;
    
    try {
      const method = req.method;
      const body = req.body;
      const headers = req.headers;
      
      const response = await firstValueFrom(
        this.httpService.request({
          method: method as any,
          url,
          data: body,
          headers: {
            ...headers,
            host: undefined, // 移除原始host头
          },
          responseType: 'stream',
          timeout: serviceInstance.timeout,
        }),
      );

      // 设置响应头
      Object.entries(response.headers).forEach(([key, value]) => {
        if (key.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(key, value as string);
        }
      });

      res.status(response.status);
      
      // 流式传输响应
      response.data.pipe(res);
    } catch (error: any) {
      this.logger.error(`Stream proxy failed for ${serviceName}: ${error.message}`);
      
      this.loadBalancerService.markInstanceUnhealthy(serviceName, serviceInstance.baseUrl);
      
      if (!res.headersSent) {
        res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          error: 'Service temporarily unavailable',
        });
      }
    }
  }
}