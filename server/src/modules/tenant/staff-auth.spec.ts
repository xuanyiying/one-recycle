import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StaffService } from './services/staff.service';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/common/redis/redis.service';

describe('Staff Auth Role Propagation', () => {
  let staffService: StaffService;
  let prismaService: any;
  let jwtService: any;

  const mockRole = {
    id: 1,
    code: 'ADMIN',
    name: '超级管理员',
    isAdmin: true,
  };

  const mockTenant = {
    id: BigInt(1),
    name: '测试租户',
    code: 'TEST',
  };

  const mockStaff = {
    id: BigInt(1),
    username: 'admin',
    password: 'hashed_password',
    realName: '管理员',
    tenantId: mockTenant.id,
    roleId: mockRole.id,
    status: 'ACTIVE',
    role: mockRole,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaService = {
      staff: {
        findFirst: jest.fn().mockResolvedValue(mockStaff),
        update: jest
          .fn()
          .mockResolvedValue({ ...mockStaff, lastLoginAt: new Date() }),
      },
      tenant: {
        findUnique: jest.fn().mockResolvedValue(mockTenant),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        { provide: PrismaService, useValue: prismaService },
        { provide: RedisService, useValue: {} },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('secret'),
          },
        },
      ],
    }).compile();

    staffService = module.get<StaffService>(StaffService);
  });

  describe('login - role field in JWT payload', () => {
    it('should include role field in JWT token payload', async () => {
      jest.spyOn(staffService as any, 'verifyPassword').mockReturnValue(true);

      const loginDto = {
        username: 'admin',
        password: '123456',
        tenantCode: 'TEST',
      };

      await staffService.login(loginDto);

      expect(jwtService.sign).toHaveBeenCalled();
      const payload = jwtService.sign.mock.calls[0][0];

      expect(payload).toHaveProperty('role');
      expect(payload.role).toBe('ADMIN');
    });

    it('should include roleCode field in JWT token payload', async () => {
      jest.spyOn(staffService as any, 'verifyPassword').mockReturnValue(true);

      const loginDto = {
        username: 'admin',
        password: '123456',
        tenantCode: 'TEST',
      };

      await staffService.login(loginDto);

      expect(jwtService.sign).toHaveBeenCalled();
      const payload = jwtService.sign.mock.calls[0][0];

      expect(payload).toHaveProperty('roleCode');
      expect(payload.roleCode).toBe('ADMIN');
    });

    it('should include roleId in JWT token payload', async () => {
      jest.spyOn(staffService as any, 'verifyPassword').mockReturnValue(true);

      const loginDto = {
        username: 'admin',
        password: '123456',
        tenantCode: 'TEST',
      };

      await staffService.login(loginDto);

      expect(jwtService.sign).toHaveBeenCalled();
      const payload = jwtService.sign.mock.calls[0][0];

      expect(payload).toHaveProperty('roleId');
      expect(payload.roleId).toBe(mockRole.id);
    });
  });
});
