import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { ThirdPartyLoginDto } from './dto/third-party-login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      sendVerificationCode: jest.fn(),
      refreshToken: jest.fn(),
      logout: jest.fn(),
      thirdPartyLogin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginDto: LoginDto = { mobile: '13800138000', verificationCode: '123456' };
      const expectedResult = {
        user: {
          id: 'user-123',
          phone: '13800138000',
          nickname: '测试用户',
          avatar: null,
          role: 'USER',
          status: 'ACTIVE',
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 86400,
        },
        sessionId: 'session-123',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('sendCode', () => {
    it('should send verification code successfully', async () => {
      const sendCodeDto: SendCodeDto = { mobile: '13800138000', type: 'login' };
      const expectedResult = { success: true, message: '验证码发送成功' };

      jest.spyOn(authService, 'sendVerificationCode').mockResolvedValue(expectedResult);

      const result = await controller.sendCode(sendCodeDto);

      expect(result).toEqual(expectedResult);
      expect(authService.sendVerificationCode).toHaveBeenCalledWith(sendCodeDto);
    });
  });

  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      const refreshTokenDto: RefreshTokenDto = { refreshToken: 'refresh-token' };
      const expectedResult = { accessToken: 'new-access-token', expiresIn: 86400 };

      jest.spyOn(authService, 'refreshToken').mockResolvedValue(expectedResult);

      const result = await controller.refresh(refreshTokenDto);

      expect(result).toEqual(expectedResult);
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const req = { user: { id: 'user-123' } };
      const logoutDto: LogoutDto = { refreshToken: 'refresh-token-123' };
      const expectedResult = { success: true, message: '登出成功' };

      jest.spyOn(authService, 'logout').mockResolvedValue(expectedResult);

      const result = await controller.logout(req, logoutDto);

      expect(result).toEqual(expectedResult);
      expect(authService.logout).toHaveBeenCalledWith(req.user.id, logoutDto);
    });
  });

  describe('thirdPartyLogin', () => {
    it('should handle third party login successfully', async () => {
      const platform = 'wechat';
      const thirdPartyLoginDto: ThirdPartyLoginDto = { code: 'auth-code' };
      const expectedResult = {
        user: {
          id: 'user-123',
          phone: '13800138000',
          nickname: '测试用户',
          avatar: null,
          role: 'USER',
          status: 'ACTIVE',
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 86400,
        },
        sessionId: 'session-123',
      };

      jest.spyOn(authService, 'thirdPartyLogin').mockResolvedValue(expectedResult);

      const result = await controller.thirdPartyLogin(platform, thirdPartyLoginDto);

      expect(result).toEqual(expectedResult);
      expect(authService.thirdPartyLogin).toHaveBeenCalledWith(platform, thirdPartyLoginDto);
    });
  });
});