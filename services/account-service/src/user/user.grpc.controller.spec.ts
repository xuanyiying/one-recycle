import { Test, TestingModule } from '@nestjs/testing';
import { UserGrpcController } from './user.grpc.controller';
import { UserService } from './user.service';
import {
  createTestUser,
  createTestUserResponse,
} from '../../tests/test-utils';
import {
  CreateUserRequest,
  UpdateUserRequest,
  GetUserRequest,
} from '../proto/account.pb';

describe('UserGrpcController', () => {
  let controller: UserGrpcController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const mockUserService = {
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      findByIdentity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserGrpcController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserGrpcController>(UserGrpcController);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const request: CreateUserRequest = {
        mobile: '13800138000',
        nickname: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      };
      const expectedUser = createTestUserResponse();

      userService.create.mockResolvedValue(expectedUser);

      const result = await controller.createUser(request);

      expect(userService.create).toHaveBeenCalledWith({
        mobile: request.mobile,
        nickname: request.nickname,
        avatarUrl: request.avatarUrl,
      });
      expect(result.id).toEqual(expectedUser.id);
      expect(result.mobile).toEqual(expectedUser.mobile);
      expect(result.nickname).toEqual(expectedUser.nickname);
    });

    it('should handle creation errors', async () => {
      const request: CreateUserRequest = {
        mobile: '13800138000',
        nickname: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      };
      const error = new Error('Creation failed');

      userService.create.mockRejectedValue(error);

      const result = await controller.createUser(request);
      expect(result).toEqual({ code: 13 }); // INTERNAL
    });
  });

  describe('getUser', () => {
    it('should return a user by ID', async () => {
      const request: GetUserRequest = { id: 1 };
      const expectedUser = createTestUserResponse();

      userService.findOne.mockResolvedValue(expectedUser);

      const result = await controller.getUser(request);

      expect(userService.findOne).toHaveBeenCalledWith(request.id);
      expect(result.id).toEqual(expectedUser.id);
      expect(result.mobile).toEqual(expectedUser.mobile);
      expect(result.nickname).toEqual(expectedUser.nickname);
    });

    it('should handle user not found', async () => {
      const request: GetUserRequest = { id: 999 };
      const error = new Error('User not found');

      userService.findOne.mockRejectedValue(error);

      const result = await controller.getUser(request);
      expect(result).toEqual({ code: 5 }); // NOT_FOUND
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const request: UpdateUserRequest = {
        id: 1,
        nickname: 'Updated User',
        avatarUrl: 'https://example.com/updated-avatar.jpg',
      };
      const expectedUser = createTestUserResponse();

      userService.update.mockResolvedValue(expectedUser);

      const result = await controller.updateUser(request);

      expect(userService.update).toHaveBeenCalledWith(request.id, {
        nickname: request.nickname,
        avatarUrl: request.avatarUrl,
      });
      expect(result.id).toEqual(expectedUser.id);
      expect(result.mobile).toEqual(expectedUser.mobile);
      expect(result.nickname).toEqual(expectedUser.nickname);
    });

    it('should handle user not found during update', async () => {
      const request: UpdateUserRequest = {
        id: 999,
        nickname: 'Updated User',
        avatarUrl: 'https://example.com/updated-avatar.jpg',
      };
      const error = new Error('User not found');

      userService.update.mockRejectedValue(error);

      const result = await controller.updateUser(request);
      expect(result).toEqual({ code: 5 }); // NOT_FOUND
    });
  });




});