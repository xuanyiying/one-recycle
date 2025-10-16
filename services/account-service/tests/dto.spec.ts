import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateUserDto } from '../src/user/dto/create-user.dto';
import { UpdateUserDto } from '../src/user/dto/update-user.dto';
import { CreateAddressDto } from '../src/address/dto/create-address.dto';

describe('DTO Validation', () => {
  describe('CreateUserDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToClass(CreateUserDto, {
        mobile: '13800138000',
        nickname: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
        provider: 'wechat',
        openid: 'openid123',
        appId: 'appid123',
        unionid: 'unionid123',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing required mobile field', async () => {
      const dto = plainToClass(CreateUserDto, {
        nickname: 'Test User',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      
      const mobileError = errors.find(error => error.property === 'mobile');
      expect(mobileError).toBeDefined();
    });

    it('should fail validation with invalid mobile number', async () => {
      const dto = plainToClass(CreateUserDto, {
        mobile: '123',
        nickname: 'Test User',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      
      const mobileError = errors.find(error => error.property === 'mobile');
      expect(mobileError).toBeDefined();
      expect(Object.values(mobileError?.constraints || {})).toContain('mobile must be a valid phone number');
    });

    it('should pass validation with only required mobile field', async () => {
      const dto = plainToClass(CreateUserDto, {
        mobile: '13800138000',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('UpdateUserDto', () => {
    it('should pass validation with valid partial data', async () => {
      const dto = plainToClass(UpdateUserDto, {
        nickname: 'Updated User',
        avatarUrl: 'https://example.com/updated-avatar.jpg',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with empty object', async () => {
      const dto = plainToClass(UpdateUserDto, {});

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid mobile number', async () => {
      const dto = plainToClass(UpdateUserDto, {
        mobile: '123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      
      const mobileError = errors.find(error => error.property === 'mobile');
      expect(mobileError).toBeDefined();
      expect(Object.values(mobileError?.constraints || {})).toContain('mobile must be a valid phone number');
    });
  });

  describe('CreateAddressDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToClass(CreateAddressDto, {
        userId: 1,
        consignee: 'John Doe',
        mobile: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '某某街道123号',
        isDefault: true,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing required fields', async () => {
      const dto = plainToClass(CreateAddressDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      
      const errorMessages = errors.map(error => Object.values(error.constraints || {})).flat();
      expect(errorMessages).toContain('userId should not be empty');
      expect(errorMessages).toContain('consignee should not be empty');
      expect(errorMessages).toContain('mobile should not be empty');
      expect(errorMessages).toContain('province should not be empty');
      expect(errorMessages).toContain('city should not be empty');
      expect(errorMessages).toContain('district should not be empty');
      expect(errorMessages).toContain('detail should not be empty');
    });

    it('should fail validation with invalid mobile number', async () => {
      const dto = plainToClass(CreateAddressDto, {
        userId: 1,
        consignee: 'John Doe',
        mobile: '123',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '某某街道123号',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      
      const mobileError = errors.find(error => error.property === 'mobile');
      expect(mobileError).toBeDefined();
      expect(Object.values(mobileError?.constraints || {})).toContain('mobile must be a valid phone number');
    });

    it('should pass validation without isDefault field', async () => {
      const dto = plainToClass(CreateAddressDto, {
        userId: 1,
        consignee: 'John Doe',
        mobile: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '某某街道123号',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with isDefault as boolean', async () => {
      const dto = plainToClass(CreateAddressDto, {
        userId: 1,
        consignee: 'John Doe',
        mobile: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '某某街道123号',
        isDefault: true,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});