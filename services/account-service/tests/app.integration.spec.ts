import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { createMockPrismaService } from './test-utils';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: any;

  beforeEach(async () => {
    const mockPrismaService = createMockPrismaService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();

    // 启用全局验证管道
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/users (POST)', () => {
    it('应该创建新用户', async () => {
      const createUserDto = {
        mobile: '13800138000',
        nickname: '测试用户',
        avatarUrl: 'https://example.com/avatar.jpg',
        provider: 'wechat',
        openid: 'openid123',
        appId: 'appid123',
        unionid: 'unionid123',
      };

      const expectedUser = {
        id: BigInt(1),
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(expectedUser);

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.mobile).toBe(createUserDto.mobile);
          expect(res.body.nickname).toBe(createUserDto.nickname);
        });
    });

    it('应该拒绝无效的用户数据', async () => {
      const invalidUserDto = {
        mobile: '123456', // 无效手机号
      };

      // 模拟手机号冲突的情况，这会返回409而不是400
      const existingUser = {
        id: BigInt(1),
        mobile: '123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(existingUser);

      return request(app.getHttpServer())
        .post('/users')
        .send(invalidUserDto)
        .expect(400);
    });
  });

  describe('/users/:id (GET)', () => {
    it('应该返回指定用户', async () => {
      const userId = 1;
      const user = {
        id: BigInt(userId),
        mobile: '13800138000',
        nickname: '测试用户',
        avatarUrl: 'https://example.com/avatar.jpg',
        provider: 'wechat',
        openid: 'openid123',
        appId: 'appid123',
        unionid: 'unionid123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(user);

      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.mobile).toBe(user.mobile);
          expect(res.body.nickname).toBe(user.nickname);
        });
    });

    it('应该返回404当用户不存在时', async () => {
      const userId = 999;

      prismaService.user.findUnique.mockResolvedValue(null);

      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(404);
    });
  });

  describe('/addresses (POST)', () => {
    it('应该创建新地址', async () => {
      const createAddressDto = {
        userId: 1,
        consignee: '张三',
        mobile: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '某某街道123号',
        isDefault: false,
      };

      const user = {
        id: BigInt(1),
        mobile: '13800138000',
        nickname: '测试用户',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedAddress = {
        id: BigInt(1),
        ...createAddressDto,
        userId: BigInt(createAddressDto.userId),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(user);
      prismaService.address.create.mockResolvedValue(expectedAddress);

      return request(app.getHttpServer())
        .post('/addresses')
        .send(createAddressDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.consignee).toBe(createAddressDto.consignee);
          expect(res.body.mobile).toBe(createAddressDto.mobile);
        });
    });

    it('应该拒绝无效的地址数据', async () => {
      const invalidAddressDto = {
        // 缺少必需的字段来触发验证错误
      };

      return request(app.getHttpServer())
        .post('/addresses')
        .send(invalidAddressDto)
        .expect(400);
    });
  });

  describe('/addresses/user/:userId (GET)', () => {
    it('应该返回用户的所有地址', async () => {
      const userId = 1;
      const addresses = [
        {
          id: BigInt(1),
          userId: BigInt(userId),
          consignee: '张三',
          mobile: '13800138000',
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          detail: '某某街道123号',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: BigInt(2),
          userId: BigInt(userId),
          consignee: '李四',
          mobile: '13900139000',
          province: '上海市',
          city: '上海市',
          district: '浦东新区',
          detail: '某某路456号',
          isDefault: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaService.address.findMany.mockResolvedValue(addresses);

      return request(app.getHttpServer())
        .get(`/addresses/user/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
          expect(res.body[0].consignee).toBe('张三');
          expect(res.body[1].consignee).toBe('李四');
        });
    });

    it('应该返回空数组当用户没有地址时', async () => {
      const userId = 1;

      prismaService.address.findMany.mockResolvedValue([]);

      return request(app.getHttpServer())
        .get(`/addresses/user/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(0);
        });
    });
  });
});