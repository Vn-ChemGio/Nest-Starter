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
