import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from '../services';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let authService: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: {
            constructor: jest.fn(),
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  describe('validate', () => {
    const sampleData = {
      id: '123',
      name: 'abc',
      email: 'abc@123.com',
      password: 'xxxx',
    };
    it('should return an user if email is valid ', async () => {
      const validateUserSpy = jest
        .spyOn(authService, 'validateUser')
        .mockResolvedValue({
          ...sampleData,
        } as any);

      const result = await jwtStrategy.validate(sampleData);

      expect(validateUserSpy).toHaveBeenCalledWith(sampleData.id);
      expect(validateUserSpy).toHaveBeenCalled();

      expect(result.email).toEqual(sampleData.email);
    });

    it('should return an error if email is invalid ', async () => {
      const validateUserSpy = jest
        .spyOn(authService, 'validateUser')
        .mockResolvedValue(null);

      await expect(jwtStrategy.validate(sampleData)).rejects.toEqual(
        new UnauthorizedException('Invalid token'),
      );
      expect(validateUserSpy).toHaveBeenCalledWith(sampleData.id);
      expect(validateUserSpy).toHaveBeenCalled();
    });
  });
});
