import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@user/entities';
import { LoginUserDto, RegisterUserDto } from '../dto';
import { AuthService } from '../services';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            constructor: jest.fn(),
            register: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
            getAccess2FA: jest.fn(),
            generateTwoFactorAuthenticationSecret: jest.fn(),
            isTwoFactorAuthenticationCodeValid: jest.fn(),
            pipeQrCodeStream: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should return accessToken, email, expiresIn in response', async () => {
      const sampleData: RegisterUserDto = {
        username: 'abc',
        email: 'abc@123.com',
        password: 'xxxx',
        passwordConfirm: 'ttt',
      };

      const registerSpy = jest
        .spyOn(authService, 'register')
        .mockResolvedValue({
          email: sampleData.email,
          expiresIn: '30m',
          accessToken: 'jwttoken',
        });

      const result = await controller.register(sampleData);

      expect(registerSpy).toHaveBeenCalledWith(sampleData);
      expect(registerSpy).toHaveBeenCalled();

      expect(result.accessToken).toBeTruthy();
      expect(result.expiresIn).toBeDefined();
      expect(result.email).toEqual(sampleData.email);
    });
  });

  describe('login', () => {
    it('should return accessToken, refreshToken, email, expiresIn in response ', async () => {
      const sampleData = {
        email: 'abc@123.com',
        password: 'xxxx',
      } as User;
      const credential: LoginUserDto = {
        credential: 'abc@123.com',
        password: 'xxxx',
      };
      const loginSpy = jest.spyOn(authService, 'login').mockResolvedValue({
        email: sampleData.email,
        expiresIn: '30m',
        accessToken: 'jwttoken',
        refreshToken: 'jwt_refreshToken',
        expiresInRefresh: '30 days',
      });

      const result = await controller.login(credential);

      expect(loginSpy).toHaveBeenCalled();
      expect(loginSpy).toHaveBeenCalledWith(credential);

      expect(result.accessToken).toBeTruthy();
      expect(result.expiresIn).toBeDefined();
      expect(result.refreshToken).toBeTruthy();
      expect(result.expiresInRefresh).toBeDefined();
      expect(result.email).toEqual(sampleData.email);
    });
  });

  describe('refresh', () => {
    it('should return accessToken in response ', async () => {
      const sampleData = {
        email: 'abc@123.com',
        password: 'xxxx',
      };
      const body = {
        refresh_token: 'any_token',
      };
      const refreshSpy = jest.spyOn(authService, 'refresh').mockResolvedValue({
        email: sampleData.email,
        expiresIn: '30m',
        accessToken: 'jwttoken',
      });

      const result = await controller.refresh(body);

      expect(refreshSpy).toHaveBeenCalledWith(body.refresh_token);
      expect(refreshSpy).toHaveBeenCalled();

      expect(result.accessToken).toBeTruthy();
      expect(result.expiresIn).toBeDefined();
      expect(result.email).toEqual(sampleData.email);
    });
  });

  describe('generate', () => {
    it('should complete without error', async () => {
      const req = { user: { email: 'abc@123.com', _id: '123' } };
      const res = { user: { email: 'abc@123.com', _id: '123' } };

      const data = { otpAuthUrl: 'any_url' };

      const generateSpy = jest
        .spyOn(authService, 'generateTwoFactorAuthenticationSecret')
        .mockResolvedValue(data as any);
      const pipeQrSpy = jest
        .spyOn(authService, 'pipeQrCodeStream')
        .mockResolvedValue({} as any);

      await controller.generate(req, res);

      expect(generateSpy).toHaveBeenCalledWith(req.user);
      expect(generateSpy).toHaveBeenCalled();

      expect(pipeQrSpy).toHaveBeenCalledWith(res, data.otpAuthUrl);
      expect(pipeQrSpy).toHaveBeenCalled();
    });
  });

  describe('authentication', () => {
    it('should return data in response if code is valid ', async () => {
      const req = { user: { email: 'abc@123.com', _id: '123' } };
      const body = { code: '111' };
      const validSpy = jest
        .spyOn(authService, 'isTwoFactorAuthenticationCodeValid')
        .mockResolvedValue(true as any);

      const getAccess2FASpy = jest
        .spyOn(authService, 'getAccess2FA')
        .mockResolvedValue({
          accessToken: 'any',
          refreshToken: 'any',
        } as any);

      const result = await controller.authentication(req, body.code);

      expect(validSpy).toHaveBeenCalledWith(body.code, req.user);
      expect(validSpy).toHaveBeenCalled();

      expect(getAccess2FASpy).toHaveBeenCalledWith(req.user);
      expect(getAccess2FASpy).toHaveBeenCalled();

      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    it('should return an error if code is invalid ', async () => {
      const req = { user: { email: 'abc@123.com', _id: '123' } };
      const body = { code: '111' };
      const validSpy = jest
        .spyOn(authService, 'isTwoFactorAuthenticationCodeValid')
        .mockResolvedValue(false as any);

      const getAccess2FASpy = jest
        .spyOn(authService, 'getAccess2FA')
        .mockResolvedValue({
          accessToken: 'any',
          refreshToken: 'any',
        } as any);

      await expect(controller.authentication(req, body.code)).rejects.toEqual(
        new UnauthorizedException('Wrong authentication code'),
      );

      expect(validSpy).toHaveBeenCalledWith(body.code, req.user);
      expect(validSpy).toHaveBeenCalled();

      expect(getAccess2FASpy).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should return statusCode in response ', async () => {
      const req = { user: { email: 'abc@123.com' } };

      const logoutSpy = jest
        .spyOn(authService, 'logout')
        .mockResolvedValue({} as any);

      const result = await controller.logout(req);

      expect(logoutSpy).toHaveBeenCalledWith(req.user);
      expect(logoutSpy).toHaveBeenCalled();

      expect(result.statusCode).toEqual(200);
    });
  });
});
