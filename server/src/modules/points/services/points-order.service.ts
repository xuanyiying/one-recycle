import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  PointsOrder,
  PointsOrderStatus,
  ProductType,
  PointsType,
  Prisma,
} from '@prisma/client';
import { QueryOrderDto } from '../dto/query-order.dto';
import { PointsProductService } from './points-product.service';
import { CreatePointsOrderDto } from '../dto/create-order.dto';

@Injectable()
export class PointsOrderService {
  private readonly logger = new Logger(PointsOrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: PointsProductService,
  ) {}

  /**
   * 生成订单号
   */
  private generateOrderNo(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PO${timestamp}${random}`;
  }

  /**
   * 创建兑换订单
   */
  async create(
    userId: bigint,
    dto: CreatePointsOrderDto,
  ): Promise<PointsOrder> {
    const product = await this.productService.findOne(dto.productId);

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    if (product.status !== 'ACTIVE') {
      throw new BadRequestException('商品已下架');
    }

    if (product.stock < dto.quantity) {
      throw new BadRequestException('库存不足');
    }

    const totalPoints = product.points * dto.quantity;

    // 实物商品需要地址
    if (product.type === ProductType.PHYSICAL && !dto.addressId) {
      throw new BadRequestException('实物商品需要填写收货地址');
    }

    // 获取地址快照
    let addressSnapshot: any = undefined;
    if (dto.addressId) {
      const address = await this.prisma.address.findUnique({
        where: { id: dto.addressId },
      });
      if (address) {
        addressSnapshot = {
          name: address.name,
          mobile: address.mobile,
          province: address.province,
          city: address.city,
          district: address.district,
          detail: address.detail,
        };
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // 在事务内检查用户积分是否足够
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });

      if (!user) {
        throw new NotFoundException('用户不存在');
      }

      if (user.points < totalPoints) {
        throw new BadRequestException('积分不足');
      }

      // 扣减库存
      const stockDecreased = await this.productService.decreaseStock(
        product.id,
        dto.quantity,
        tx,
      );

      if (!stockDecreased) {
        throw new BadRequestException('库存扣减失败，请重试');
      }

      // 扣减用户积分
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { points: { decrement: totalPoints } },
        select: { points: true },
      });

      // 验证扣减后余额不为负（防止并发竞态）
      if (updatedUser.points < 0) {
        throw new BadRequestException('积分不足');
      }

      // 创建订单
      const order = await tx.pointsOrder.create({
        data: {
          orderNo: this.generateOrderNo(),
          userId,
          productId: product.id,
          productName: product.name,
          productImage: product.coverImage,
          productType: product.type,
          points: totalPoints,
          quantity: dto.quantity,
          status:
            product.type === ProductType.VIRTUAL
              ? PointsOrderStatus.COMPLETED
              : PointsOrderStatus.PENDING,
          addressId: dto.addressId,
          addressSnapshot,
          remark: dto.remark,
          completedAt: product.type === ProductType.VIRTUAL ? new Date() : null,
        },
      });

      // 记录积分变动
      await tx.pointsRecord.create({
        data: {
          userId,
          type: PointsType.EXCHANGE,
          points: -totalPoints,
          balanceAfter: updatedUser.points,
          sourceType: 'POINTS_ORDER',
          sourceId: order.id.toString(),
          description: `兑换商品: ${product.name}`,
        },
      });

      this.logger.log(
        `Order created: ${order.orderNo}, user: ${userId}, points: ${totalPoints}`,
      );

      return order;
    });
  }

  /**
   * 取消订单
   */
  async cancel(userId: bigint, orderId: bigint): Promise<PointsOrder> {
    const order = await this.prisma.pointsOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('无权操作此订单');
    }

    if (order.status !== PointsOrderStatus.PENDING) {
      throw new BadRequestException('订单状态不允许取消');
    }

    return this.prisma.$transaction(async (tx) => {
      // 恢复库存
      await this.productService.increaseStock(
        order.productId,
        order.quantity,
        tx,
      );

      // 退还积分
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { points: { increment: order.points } },
        select: { points: true },
      });

      // 更新订单状态
      const updatedOrder = await tx.pointsOrder.update({
        where: { id: orderId },
        data: {
          status: PointsOrderStatus.CANCELLED,
        },
      });

      // 记录积分变动
      await tx.pointsRecord.create({
        data: {
          userId,
          type: PointsType.REFUND,
          points: order.points,
          balanceAfter: updatedUser.points,
          sourceType: 'POINTS_ORDER',
          sourceId: order.id.toString(),
          description: `订单取消退还: ${order.productName}`,
        },
      });

      return updatedOrder;
    });
  }

  /**
   * 发货（管理员）
   */
  async ship(
    orderId: bigint,
    logisticsNo: string,
    logisticsCompany: string,
  ): Promise<PointsOrder> {
    const order = await this.prisma.pointsOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== PointsOrderStatus.PENDING) {
      throw new BadRequestException('订单状态不允许发货');
    }

    return this.prisma.pointsOrder.update({
      where: { id: orderId },
      data: {
        status: PointsOrderStatus.SHIPPED,
        logisticsNo,
        logisticsCompany,
        shippedAt: new Date(),
      },
    });
  }

  /**
   * 确认收货
   */
  async confirm(userId: bigint, orderId: bigint): Promise<PointsOrder> {
    const order = await this.prisma.pointsOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('无权操作此订单');
    }

    if (order.status !== PointsOrderStatus.SHIPPED) {
      throw new BadRequestException('订单状态不允许确认收货');
    }

    return this.prisma.pointsOrder.update({
      where: { id: orderId },
      data: {
        status: PointsOrderStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }

  /**
   * 获取订单详情
   */
  async findOne(orderId: bigint, userId?: bigint): Promise<PointsOrder | null> {
    const where: Prisma.PointsOrderWhereUniqueInput = { id: orderId };

    const order = await this.prisma.pointsOrder.findUnique({
      where,
      include: {
        product: true,
        address: true,
      },
    });

    if (userId && order && order.userId !== userId) {
      return null;
    }

    return order;
  }

  /**
   * 获取用户订单列表
   */
  async findByUser(userId: bigint, query: QueryOrderDto) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PointsOrderWhereInput = { userId };

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.pointsOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              coverImage: true,
              type: true,
            },
          },
        },
      }),
      this.prisma.pointsOrder.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取所有订单（管理员）
   */
  async findAll(query: QueryOrderDto) {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PointsOrderWhereInput = {};

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.pointsOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              avatarUrl: true,
              mobile: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              coverImage: true,
            },
          },
        },
      }),
      this.prisma.pointsOrder.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
