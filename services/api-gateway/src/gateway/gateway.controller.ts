import {
  Controller,
  All,
  Req,
  Res,
  Param,
  Body,
  Headers,
  Query,
  Get,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from '../services/proxy.service';
import { LoadBalancerService } from '../services/load-balancer.service';

@Controller('api')
export class GatewayController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly loadBalancerService: LoadBalancerService,
  ) {}

  /**
   * 健康检查端点
   */
  @Get('health')
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: this.loadBalancerService.getServicesHealth(),
    };
  }

  /**
   * API聚合端点 - 批量请求多个服务
   */
  @Post('aggregate')
  async aggregate(
    @Body() requests: Array<{
      key: string;
      service: string;
      path: string;
      method: string;
      body?: any;
      headers?: Record<string, string>;
    }>,
    @Headers() headers: Record<string, string>,
  ) {
    if (!Array.isArray(requests) || requests.length === 0) {
      throw new HttpException('Invalid requests array', HttpStatus.BAD_REQUEST);
    }

    const aggregationRequests = requests.map(req => ({
      key: req.key,
      serviceName: req.service,
      path: req.path,
      method: req.method,
      body: req.body,
      headers: { ...headers, ...req.headers },
    }));

    return await this.proxyService.aggregateRequests(aggregationRequests);
  }

  /**
   * 用户服务路由 - 处理 /api/v1/users 和 /api/v1/users/*
   */
  @All('v1/users')
  async proxyToUserService(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const path = (req as any).originalUrl.replace('/api/v1/users', '');
    await this.proxyService.streamProxy(req, res, 'account-service', `/users${path}`);
  }

  /**
   * 用户服务路由 - 处理子路径
   */
  @All('v1/users/*')
  async proxyToUserServiceWithPath(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const path = (req as any).originalUrl.replace('/api/v1/users', '');
    await this.proxyService.streamProxy(req, res, 'account-service', `/users${path}`);
  }

  /**
   * 订单服务路由
   */
  @All('v1/orders/*')
  async proxyToOrderService(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const path = (req as any).originalUrl.replace('/api/v1/orders', '');
    await this.proxyService.streamProxy(req, res, 'order-service', `/orders${path}`);
  }

  /**
   * 配送服务路由
   */
  @All('v1/dispatch/*')
  async proxyToDispatchService(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const path = (req as any).originalUrl.replace('/api/v1/dispatch', '');
    await this.proxyService.streamProxy(req, res, 'dispatch-service', `/dispatch${path}`);
  }

  /**
   * 快递员服务路由
   */
  @All('v1/couriers/*')
  async proxyToCourierService(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const path = (req as any).originalUrl.replace('/api/v1/couriers', '');
    await this.proxyService.streamProxy(req, res, 'courier-service', `/couriers${path}`);
  }

  /**
   * 通知服务路由
   */
  @All('v1/notifications/*')
  async proxyToNotificationService(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const path = (req as any).originalUrl.replace('/api/v1/notifications', '');
    await this.proxyService.streamProxy(req, res, 'notification-service', `/notifications${path}`);
  }

  /**
   * 支付服务路由
   */
  @All('v1/payments/*')
  async proxyToPaymentService(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const path = (req as any).originalUrl.replace('/api/v1/payments', '');
    await this.proxyService.streamProxy(req, res, 'payment-service', `/payments${path}`);
  }

  /**
   * 账户服务路由 - 积分账户管理
   */
  @All('accounts')
  async proxyToAccountsRoot(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const path = (req as any).originalUrl.replace('/api/accounts', '');
    await this.proxyService.streamProxy(req, res, 'payment-service', `/accounts${path}`);
  }

  @All('accounts/*')
  async proxyToAccounts(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const path = (req as any).originalUrl.replace('/api/accounts', '');
    await this.proxyService.streamProxy(req, res, 'payment-service', `/accounts${path}`);
  }

  /**
   * 提现服务路由
   */
  @All('withdrawals')
  async proxyToWithdrawalsRoot(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const path = (req as any).originalUrl.replace('/api/withdrawals', '');
    await this.proxyService.streamProxy(req, res, 'payment-service', `/withdrawals${path}`);
  }

  @All('withdrawals/*')
  async proxyToWithdrawals(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const path = (req as any).originalUrl.replace('/api/withdrawals', '');
    await this.proxyService.streamProxy(req, res, 'payment-service', `/withdrawals${path}`);
  }

  /**
   * 库存服务路由
   */
  @All('v1/inventory/*')
  async proxyToInventoryService(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const path = (req as any).originalUrl.replace('/api/v1/inventory', '');
    await this.proxyService.streamProxy(req, res, 'inventory-service', `/inventory${path}`);
  }

  /**
   * 分类服务路由 - 处理 /api/category/categories
   */
  @All('category/categories')
  async proxyToCategoryRoot(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const path = (req as any).originalUrl.replace('/api/category/categories', '');
    await this.proxyService.streamProxy(req, res, 'category-service', `/api/categories${path}`);
  }

  @All('category/categories/*')
  async proxyToCategoryWithPath(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const path = (req as any).originalUrl.replace('/api/category/categories', '');
    await this.proxyService.streamProxy(req, res, 'category-service', `/api/categories${path}`);
  }

  /**
   * 分类服务路由 - v1版本
   */
  @All('v1/categories/*')
  async proxyToCategoryService(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const path = (req as any).originalUrl.replace('/api/v1/categories', '');
    await this.proxyService.streamProxy(req, res, 'category-service', `/api/categories${path}`);
  }

  /**
   * 认证服务路由 - 特殊处理，不需要认证
   */
  @All('v1/auth/*')
  async proxyToAuthService(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const path = (req as any).originalUrl.replace('/api/v1/auth', '');
    await this.proxyService.streamProxy(req, res, 'account-service', `/auth${path}`);
  }

  /**
   * 通用代理端点 - 用于动态路由
   */
  @All('v1/:service/*')
  async proxyToService(
    @Param('service') service: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const serviceName = `${service}-service`;
    const path = (req as any).originalUrl.replace(`/api/v1/${service}`, '');
    
    await this.proxyService.streamProxy(req, res, serviceName, path);
  }
}