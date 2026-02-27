import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  ServiceTicket,
  TicketStatus,
  TicketPriority,
  TicketAction,
  Prisma,
} from '@prisma/client';
import {
  CreateTicketDto,
  UpdateTicketDto,
  AssignTicketDto,
  ResolveTicketDto,
  AddTicketCommentDto,
  QueryTicketDto,
} from '../dto';

@Injectable()
export class TicketService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(dto: CreateTicketDto, userId: string): Promise<ServiceTicket> {
    const ticketNo = this.generateTicketNo();

    const ticket = await this.prisma.serviceTicket.create({
      data: {
        ticketNo,
        sessionId: dto.sessionId ? BigInt(dto.sessionId) : null,
        userId: BigInt(userId),
        orderId: dto.orderId ? BigInt(dto.orderId) : null,
        type: dto.type,
        priority: dto.priority || TicketPriority.NORMAL,
        title: dto.title,
        description: dto.description,
        attachments: dto.attachments || [],
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            mobile: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNo: true,
            status: true,
          },
        },
      },
    });

    await this.createHistory(
      ticket.id.toString(),
      null,
      TicketAction.CREATE,
      undefined,
      TicketStatus.PENDING,
      '工单创建',
    );

    return ticket;
  }

  async findOne(id: string): Promise<ServiceTicket | null> {
    return this.prisma.serviceTicket.findUnique({
      where: { id: BigInt(id) },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            mobile: true,
            avatarUrl: true,
          },
        },
        order: true,
        assignee: {
          select: {
            id: true,
            realName: true,
            mobile: true,
          },
        },
        histories: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            operator: {
              select: {
                id: true,
                realName: true,
              },
            },
          },
        },
      },
    });
  }

  async findByTicketNo(ticketNo: string): Promise<ServiceTicket | null> {
    return this.prisma.serviceTicket.findUnique({
      where: { ticketNo },
      include: {
        user: true,
        order: true,
        assignee: true,
      },
    });
  }

  async findAll(dto: QueryTicketDto): Promise<{
    items: ServiceTicket[];
    total: number;
  }> {
    const where: Prisma.ServiceTicketWhereInput = {};

    if (dto.userId) {
      where.userId = BigInt(dto.userId);
    }

    if (dto.orderId) {
      where.orderId = BigInt(dto.orderId);
    }

    if (dto.type) {
      where.type = dto.type;
    }

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.priority) {
      where.priority = dto.priority;
    }

    if (dto.assignedTo) {
      where.assignedTo = BigInt(dto.assignedTo);
    }

    const page = dto.page || 1;
    const pageSize = dto.pageSize || 20;

    const [items, total] = await Promise.all([
      this.prisma.serviceTicket.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              mobile: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNo: true,
              status: true,
            },
          },
          assignee: {
            select: {
              id: true,
              realName: true,
            },
          },
        },
      }),
      this.prisma.serviceTicket.count({ where }),
    ]);

    return { items, total };
  }

  async update(id: string, dto: UpdateTicketDto): Promise<ServiceTicket> {
    const ticket = await this.findOne(id);
    if (!ticket) {
      throw new NotFoundException('工单不存在');
    }

    const fromStatus = ticket.status;

    const updated = await this.prisma.serviceTicket.update({
      where: { id: BigInt(id) },
      data: {
        priority: dto.priority,
        status: dto.status,
        description: dto.description,
        attachments: dto.attachments,
        updatedAt: new Date(),
      },
    });

    if (dto.status && dto.status !== fromStatus) {
      await this.createHistory(
        id,
        null,
        TicketAction.UPDATE,
        fromStatus,
        dto.status,
        '状态更新',
      );
    }

    return updated;
  }

  async assign(
    id: string,
    dto: AssignTicketDto,
    operatorId: string,
  ): Promise<ServiceTicket> {
    const ticket = await this.findOne(id);
    if (!ticket) {
      throw new NotFoundException('工单不存在');
    }

    const updated = await this.prisma.serviceTicket.update({
      where: { id: BigInt(id) },
      data: {
        assignedTo: BigInt(dto.agentId),
        status: TicketStatus.PROCESSING,
        updatedAt: new Date(),
      },
    });

    await this.createHistory(
      id,
      operatorId,
      TicketAction.ASSIGN,
      ticket.status,
      TicketStatus.PROCESSING,
      dto.note || `分配给客服处理`,
    );

    return updated;
  }

  async resolve(
    id: string,
    dto: ResolveTicketDto,
    operatorId: string,
  ): Promise<ServiceTicket> {
    const ticket = await this.findOne(id);
    if (!ticket) {
      throw new NotFoundException('工单不存在');
    }

    if (ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED) {
      throw new BadRequestException('工单已解决或已关闭');
    }

    const updated = await this.prisma.serviceTicket.update({
      where: { id: BigInt(id) },
      data: {
        status: TicketStatus.RESOLVED,
        resolution: dto.resolution,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await this.createHistory(
      id,
      operatorId,
      TicketAction.RESOLVE,
      ticket.status,
      TicketStatus.RESOLVED,
      dto.resolution,
    );

    return updated;
  }

  async close(
    id: string,
    operatorId: string,
    comment?: string,
  ): Promise<ServiceTicket> {
    const ticket = await this.findOne(id);
    if (!ticket) {
      throw new NotFoundException('工单不存在');
    }

    const updated = await this.prisma.serviceTicket.update({
      where: { id: BigInt(id) },
      data: {
        status: TicketStatus.CLOSED,
        closedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await this.createHistory(
      id,
      operatorId,
      TicketAction.CLOSE,
      ticket.status,
      TicketStatus.CLOSED,
      comment || '工单关闭',
    );

    return updated;
  }

  async reopen(
    id: string,
    operatorId: string,
    reason: string,
  ): Promise<ServiceTicket> {
    const ticket = await this.findOne(id);
    if (!ticket) {
      throw new NotFoundException('工单不存在');
    }

    if (ticket.status !== TicketStatus.CLOSED && ticket.status !== TicketStatus.RESOLVED) {
      throw new BadRequestException('只有已解决或已关闭的工单可以重开');
    }

    const updated = await this.prisma.serviceTicket.update({
      where: { id: BigInt(id) },
      data: {
        status: TicketStatus.REOPENED,
        updatedAt: new Date(),
      },
    });

    await this.createHistory(
      id,
      operatorId,
      TicketAction.REOPEN,
      ticket.status,
      TicketStatus.REOPENED,
      reason,
    );

    return updated;
  }

  async addComment(
    id: string,
    dto: AddTicketCommentDto,
    operatorId: string,
  ): Promise<void> {
    const ticket = await this.findOne(id);
    if (!ticket) {
      throw new NotFoundException('工单不存在');
    }

    await this.createHistory(
      id,
      operatorId,
      TicketAction.UPDATE,
      ticket.status,
      ticket.status,
      dto.comment,
    );
  }

  async getUserTickets(userId: string): Promise<ServiceTicket[]> {
    return this.prisma.serviceTicket.findMany({
      where: { userId: BigInt(userId) },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        order: {
          select: {
            orderNo: true,
            status: true,
          },
        },
      },
    });
  }

  async getAgentTickets(agentId: string): Promise<ServiceTicket[]> {
    return this.prisma.serviceTicket.findMany({
      where: {
        assignedTo: BigInt(agentId),
        status: { in: [TicketStatus.PENDING, TicketStatus.PROCESSING, TicketStatus.REOPENED] },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            mobile: true,
          },
        },
        order: {
          select: {
            orderNo: true,
            status: true,
          },
        },
      },
    });
  }

  async getStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    resolved: number;
    closed: number;
  }> {
    const [total, pending, processing, resolved, closed] = await Promise.all([
      this.prisma.serviceTicket.count(),
      this.prisma.serviceTicket.count({ where: { status: TicketStatus.PENDING } }),
      this.prisma.serviceTicket.count({ where: { status: TicketStatus.PROCESSING } }),
      this.prisma.serviceTicket.count({ where: { status: TicketStatus.RESOLVED } }),
      this.prisma.serviceTicket.count({ where: { status: TicketStatus.CLOSED } }),
    ]);

    return { total, pending, processing, resolved, closed };
  }

  private generateTicketNo(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TK${dateStr}${random}`;
  }

  private async createHistory(
    ticketId: string,
    operatorId: string | null,
    action: TicketAction,
    fromStatus: TicketStatus | undefined,
    toStatus: TicketStatus | undefined,
    comment: string,
  ): Promise<void> {
    await this.prisma.ticketHistory.create({
      data: {
        ticketId: BigInt(ticketId),
        operatorId: operatorId ? BigInt(operatorId) : null,
        action,
        fromStatus,
        toStatus,
        comment,
      },
    });
  }
}
