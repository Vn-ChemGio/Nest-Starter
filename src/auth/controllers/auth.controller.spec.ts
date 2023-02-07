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
});
