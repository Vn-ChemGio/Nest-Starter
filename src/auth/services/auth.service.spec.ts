import {
  BadRequestException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@user/services';
import { User } from '@user/entities';
import { givenUserData, givenUserDataWithId } from '@utils/helpers';
import { LoginUserDto } from '../dto';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findByLogin: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    const sampleData = givenUserData();

    const token = 'any_token';
    it('it should return an user if no error', async () => {
      const userCreated = {
        _id: '123',
        ...sampleData,
      };

      const creatUserSpy = jest
        .spyOn(userService, 'create')
        .mockResolvedValue(userCreated);

      const creatTokenSpy = jest
        .spyOn(jwtService, 'sign')
        .mockImplementation(() => token as never);

      const result = await authService.register(sampleData);

      expect(creatUserSpy).toBeCalledWith(sampleData);
      expect(creatUserSpy).toBeCalledTimes(1);

      expect(creatTokenSpy).toBeCalledWith({ id: userCreated._id });
      expect(creatTokenSpy).toBeCalledTimes(1);

      expect(result.email).toBeDefined();
      expect(result.expiresIn).toBeDefined();
      expect(result.accessToken).toEqual(token);
    });

    it('it should return an error if has any exception', async () => {
      const creatUserSpy = jest
        .spyOn(userService, 'create')
        .mockImplementation(() => {
          throw new HttpException('any_error', HttpStatus.BAD_REQUEST);
        });

      await expect(authService.register(sampleData)).rejects.toEqual(
        new BadRequestException('any_error'),
      );

      expect(creatUserSpy).toBeCalledWith(sampleData);
      expect(creatUserSpy).toBeCalledTimes(1);
    });
  });

  describe('login', () => {
    const sampleData = givenUserDataWithId();

    const credential: LoginUserDto = {
      credential: 'hantsy@example.com',
      password: 'mysecret',
    };

    const token = 'any_token';
    it('it should return an user if no error', async () => {
      const findUserSpy = jest
        .spyOn(userService, 'findByLogin')
        .mockResolvedValue({
          ...sampleData,
        } as User);

      const creatTokenSpy = jest
        .spyOn(jwtService, 'sign')
        .mockImplementation(() => token as never);

      const result = await authService.login(credential);

      expect(findUserSpy).toHaveBeenCalled();
      expect(findUserSpy).toBeCalledWith(credential);

      expect(creatTokenSpy).toHaveBeenCalled();
      expect(creatTokenSpy).toBeCalledWith({ id: sampleData._id });

      expect(result.email).toBeDefined();
      expect(result.expiresIn).toBeDefined();
      expect(result.accessToken).toEqual(token);
    });

    it('it should return an error if has any exception', async () => {
      const loginUserSpy = jest
        .spyOn(userService, 'findByLogin')
        .mockImplementation(() => {
          throw new HttpException('any_error', HttpStatus.UNAUTHORIZED);
        });

      await expect(authService.login(credential)).rejects.toEqual(
        new UnauthorizedException('any_error'),
      );

      expect(loginUserSpy).toHaveBeenCalled();
      expect(loginUserSpy).toBeCalledWith(credential);
    });
  });

  describe('validateUser', () => {
    const sampleData = givenUserDataWithId();

    it('it should return an user if user exists', async () => {
      const findByIdSpy = jest
        .spyOn(userService, 'findById')
        .mockResolvedValue({
          ...sampleData,
        } as User);

      const result = await authService.validateUser(sampleData._id);

      expect(findByIdSpy).toBeCalledWith(sampleData._id);
      expect(findByIdSpy).toBeCalledTimes(1);

      expect(result.email).toBeDefined();
      expect(result._id).toBeDefined();
    });

    it('it should return an error if user doesn not exists', async () => {
      const findByIdSpy = jest
        .spyOn(userService, 'findById')
        .mockResolvedValue(null);

      await expect(authService.validateUser(sampleData._id)).rejects.toEqual(
        new UnauthorizedException('Invalid token'),
      );

      expect(findByIdSpy).toHaveBeenCalled();
      expect(findByIdSpy).toBeCalledWith(sampleData._id);
    });
  });
});
