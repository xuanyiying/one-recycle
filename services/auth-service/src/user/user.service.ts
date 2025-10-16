import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    // 这里应该实现获取用户资料的逻辑
    // 暂时返回模拟数据
    return {
      id: userId,
      phone: '138****0000',
      nickname: '用户昵称',
      avatar: null,
      role: 'USER',
      status: 'ACTIVE',
    };
  }
}