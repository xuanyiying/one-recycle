import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    getProfile: jest.fn(),
  };

  const testUser = {
    id: 'user-123',
    phone: '138****0000',
    nickname: '用户昵称',
    avatar: null,
    role: 'USER',
    status: 'ACTIVE',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const req = { user: { id: 'user-123' } };
      
      jest.spyOn(userService, 'getProfile').mockResolvedValue(testUser);

      const result = await controller.getProfile(req);

      expect(result).toEqual(testUser);
      expect(userService.getProfile).toHaveBeenCalledWith(req.user.id);
    });

    it('should handle service errors', async () => {
      const req = { user: { id: 'user-123' } };
      const error = new Error('User not found');
      
      jest.spyOn(userService, 'getProfile').mockRejectedValue(error);

      await expect(controller.getProfile(req)).rejects.toThrow(error);
    });

    it('should handle missing user id', async () => {
      const req = { user: {} };
      
      jest.spyOn(userService, 'getProfile').mockResolvedValue(testUser);

      const result = await controller.getProfile(req);

      expect(userService.getProfile).toHaveBeenCalledWith(undefined);
    });
  });
});