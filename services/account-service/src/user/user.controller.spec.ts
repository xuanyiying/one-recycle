import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {
  createTestUser,
  createTestUserResponse,
  createCreateUserDto,
  createUpdateUserDto,
} from '../../tests/test-utils';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const mockUserService = {
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      findByIdentity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto = createCreateUserDto();
      const expectedUser = createTestUserResponse();

      userService.create.mockResolvedValue(expectedUser);

      const result = await controller.create(createUserDto);

      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedUser);
    });

    it('should handle service errors', async () => {
      const createUserDto = createCreateUserDto();
      const error = new Error('Service error');

      userService.create.mockRejectedValue(error);

      await expect(controller.create(createUserDto)).rejects.toThrow(error);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const userId = '1';
      const result = createTestUserResponse();

      jest.spyOn(userService, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(userId)).toBe(result);
      expect(userService.findOne).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = '999';

      jest.spyOn(userService, 'findOne').mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.findOne(userId)).rejects.toThrow(NotFoundException);
      expect(userService.findOne).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = '1';
      const updateUserDto = createUpdateUserDto();
      const result = createTestUserResponse();

      jest.spyOn(userService, 'update').mockResolvedValue(result);

      expect(await controller.update(userId, updateUserDto)).toBe(result);
      expect(userService.update).toHaveBeenCalledWith(userId, updateUserDto);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = '999';
      const updateUserDto = createUpdateUserDto();

      jest.spyOn(userService, 'update').mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.update(userId, updateUserDto)).rejects.toThrow(NotFoundException);
      expect(userService.update).toHaveBeenCalledWith(userId, updateUserDto);
    });
  });
});