import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from '../services';
import { JwtTwoFactorStrategy } from './jwtTwoFactor.strategy';

describe('JwtTwoFactorStrategy', () => {
  let jwtTwoFactorStrategy: JwtTwoFactorStrategy;
  let authService: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        JwtTwoFactorStrategy,
        {
          provide: AuthService,
          useValue: {
            constructor: jest.fn(),
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    jwtTwoFactorStrategy =
      module.get<JwtTwoFactorStrategy>(JwtTwoFactorStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(jwtTwoFactorStrategy).toBeDefined();
  });

  describe('validate', () => {
    const sampleData = {
      _id: '123',
      name: 'abc',
      email: 'abc@123.com',
      password: 'xxxx',
      isSecondFactorAuthenticated: false,
    };

    it('should return an error if can not decode jwt to get user id', async () => {
      const validateUserSpy = jest
        .spyOn(authService, 'validateUser')
        .mockResolvedValue(null);

      await expect(
        jwtTwoFactorStrategy.validate({
          _id: undefined,
          isSecondFactorAuthenticated: false,
        }),
      ).rejects.toEqual(new UnauthorizedException('Invalid token'));

      expect(validateUserSpy).not.toHaveBeenCalled();
    });

    it('should return an error if user id is invalid ', async () => {
      const validateUserSpy = jest
        .spyOn(authService, 'validateUser')
        .mockResolvedValue(null);

      await expect(
        jwtTwoFactorStrategy.validate({
          _id: sampleData._id,
          isSecondFactorAuthenticated: sampleData.isSecondFactorAuthenticated,
        }),
      ).rejects.toEqual(new UnauthorizedException('Invalid token'));

      expect(validateUserSpy).toHaveBeenCalledWith(sampleData._id);
      expect(validateUserSpy).toHaveBeenCalled();
    });

    it('should return an user if user id is valid and user turn off isTwoFactorAuthenticationEnabled', async () => {
      const validateUserSpy = jest
        .spyOn(authService, 'validateUser')
        .mockResolvedValue({
          ...sampleData,
          isTwoFactorAuthenticationEnabled: false,
        } as any);

      await jwtTwoFactorStrategy.validate({
        _id: sampleData._id,
        isSecondFactorAuthenticated: sampleData.isSecondFactorAuthenticated,
      });

      expect(validateUserSpy).toHaveBeenCalledWith(sampleData._id);
      expect(validateUserSpy).toHaveBeenCalled();
    });

    it('should return an user if user id is valid and step logic is isSecondFactorAuthenticated = true', async () => {
      const validateUserSpy = jest
        .spyOn(authService, 'validateUser')
        .mockResolvedValue({
          ...sampleData,
          isSecondFactorAuthenticated: true,
        } as any);

      await jwtTwoFactorStrategy.validate({
        _id: sampleData._id,
        isSecondFactorAuthenticated: sampleData.isSecondFactorAuthenticated,
      });

      expect(validateUserSpy).toHaveBeenCalledWith(sampleData._id);
      expect(validateUserSpy).toHaveBeenCalled();
    });

    it('should return an error if user id is valid but step logic is isSecondFactorAuthenticated = false and user turn on 2FA', async () => {
      const validateUserSpy = jest
        .spyOn(authService, 'validateUser')
        .mockResolvedValue({
          ...sampleData,
          isTwoFactorAuthenticationEnabled: true,
          isSecondFactorAuthenticated: false,
        } as any);

      await expect(
        jwtTwoFactorStrategy.validate({
          _id: sampleData._id,
          isSecondFactorAuthenticated: sampleData.isSecondFactorAuthenticated,
        }),
      ).rejects.toEqual(new ForbiddenException('Permission denied'));

      expect(validateUserSpy).toHaveBeenCalledWith(sampleData._id);
      expect(validateUserSpy).toHaveBeenCalled();
    });
  });
});
