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
            getUserByRefresh: jest.fn(),
            updateById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
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

      const updateUserSpy = jest
        .spyOn(userService, 'updateById')
        .mockResolvedValue({} as any);

      const result = await authService.register(sampleData);

      expect(creatUserSpy).toBeCalledWith(sampleData);
      expect(creatUserSpy).toBeCalledTimes(1);

      expect(creatTokenSpy).toBeCalledWith({
        id: userCreated._id,
        isSecondFactorAuthenticated: false,
      });

      expect(creatTokenSpy).toBeCalledWith(
        { id: userCreated._id },
        {
          secret: process.env.SECRETKEY_REFRESH,
          expiresIn: process.env.EXPIRESIN_REFRESH,
        },
      );

      expect(creatTokenSpy).toBeCalledTimes(2);

      expect(updateUserSpy).toBeCalledWith(userCreated._id, {
        refreshToken: token,
      });
      expect(updateUserSpy).toBeCalledTimes(1);

      expect(result.email).toBeDefined();
      expect(result.expiresIn).toBeDefined();
      expect(result.accessToken).toEqual(token);
      expect(result.expiresInRefresh).toBeDefined();
      expect(result.refreshToken).toBeDefined();
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
    const sampleData = {
      _id: '123',
      email: 'hantsy@example.com',
      password: 'mysecret',
    } as User;

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

      const updateUserSpy = jest
        .spyOn(userService, 'updateById')
        .mockResolvedValue({} as any);

      const result = await authService.login(credential);

      expect(findUserSpy).toHaveBeenCalled();
      expect(findUserSpy).toBeCalledWith(credential);

      expect(creatTokenSpy).toBeCalledWith({
        id: sampleData._id,
        isSecondFactorAuthenticated: false,
      });

      expect(creatTokenSpy).toBeCalledWith(
        { id: sampleData._id },
        {
          secret: process.env.SECRETKEY_REFRESH,
          expiresIn: process.env.EXPIRESIN_REFRESH,
        },
      );

      expect(creatTokenSpy).toBeCalledTimes(2);

      expect(updateUserSpy).toBeCalledWith(sampleData._id, {
        refreshToken: token,
      });
      expect(updateUserSpy).toBeCalledTimes(1);

      expect(result.email).toBeDefined();
      expect(result.expiresIn).toBeDefined();
      expect(result.accessToken).toEqual(token);
      expect(result.expiresInRefresh).toBeDefined();
      expect(result.refreshToken).toBeDefined();
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

  describe('refresh', () => {
    const sampleData = givenUserDataWithId();

    const token = 'any_token';
    const refreshToken = 'any_refreshToken';

    it('it should return an new access Token without error', async () => {
      const verifyTokenSpy = jest
        .spyOn(jwtService, 'verify')
        .mockImplementation(() => ({
          id: sampleData._id,
        }));

      const creatTokenSpy = jest
        .spyOn(jwtService, 'sign')
        .mockImplementation(() => token as never);

      const getUserByRefreshSpy = jest
        .spyOn(userService, 'getUserByRefresh')
        .mockResolvedValue({
          ...sampleData,
        } as User);

      const updateUserSpy = jest
        .spyOn(userService, 'updateById')
        .mockResolvedValue({} as any);

      const result = await authService.refresh(refreshToken);

      expect(verifyTokenSpy).toBeCalledWith(refreshToken, {
        secret: process.env.SECRETKEY_REFRESH,
      });
      expect(verifyTokenSpy).toBeCalledTimes(1);

      expect(getUserByRefreshSpy).toBeCalledWith(refreshToken, sampleData._id);
      expect(getUserByRefreshSpy).toBeCalledTimes(1);

      expect(creatTokenSpy).toBeCalledWith({
        id: sampleData._id,
        isSecondFactorAuthenticated: true,
      });
      expect(creatTokenSpy).toBeCalledTimes(1);

      expect(updateUserSpy).not.toHaveBeenCalled();

      expect(result.expiresIn).toBeDefined();
      expect(result.accessToken).toBeDefined();
    });

    it('it should return an error if token is invalid', async () => {
      const verifyTokenSpy = jest
        .spyOn(jwtService, 'verify')
        .mockImplementation(() => {
          throw new HttpException('any_error', HttpStatus.UNAUTHORIZED);
        });
      const creatTokenSpy = jest
        .spyOn(jwtService, 'sign')
        .mockImplementation(() => token as never);

      const getUserByRefreshSpy = jest
        .spyOn(userService, 'getUserByRefresh')
        .mockResolvedValue({
          ...sampleData,
        } as User);

      const updateUserSpy = jest
        .spyOn(userService, 'updateById')
        .mockResolvedValue({} as any);

      await expect(authService.refresh(refreshToken)).rejects.toEqual(
        new UnauthorizedException('Invalid token'),
      );

      expect(verifyTokenSpy).toBeCalledWith(refreshToken, {
        secret: process.env.SECRETKEY_REFRESH,
      });
      expect(verifyTokenSpy).toBeCalledTimes(1);

      expect(getUserByRefreshSpy).not.toHaveBeenCalled();
      expect(creatTokenSpy).not.toHaveBeenCalled();
      expect(updateUserSpy).not.toHaveBeenCalled();
    });

    it('it should return an error if getUserByRefresh can not resolved the user', async () => {
      const verifyTokenSpy = jest
        .spyOn(jwtService, 'verify')
        .mockImplementation(() => ({
          id: sampleData._id,
        }));

      const creatTokenSpy = jest
        .spyOn(jwtService, 'sign')
        .mockImplementation(() => token as never);

      const getUserByRefreshSpy = jest
        .spyOn(userService, 'getUserByRefresh')
        .mockImplementation(() => {
          throw new HttpException('any_error', HttpStatus.UNAUTHORIZED);
        });

      const updateUserSpy = jest
        .spyOn(userService, 'updateById')
        .mockResolvedValue({} as any);

      await expect(authService.refresh(refreshToken)).rejects.toEqual(
        new UnauthorizedException('Invalid token'),
      );

      expect(verifyTokenSpy).toBeCalledWith(refreshToken, {
        secret: process.env.SECRETKEY_REFRESH,
      });
      expect(verifyTokenSpy).toBeCalledTimes(1);

      expect(getUserByRefreshSpy).toBeCalledWith(refreshToken, sampleData._id);
      expect(getUserByRefreshSpy).toBeCalledTimes(1);

      expect(creatTokenSpy).not.toHaveBeenCalled();
      expect(updateUserSpy).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    const sampleData = givenUserDataWithId();

    it('it should complete without error', async () => {
      const updateUserSpy = jest
        .spyOn(userService, 'updateById')
        .mockResolvedValue({} as any);

      await authService.logout(sampleData);

      expect(updateUserSpy).toBeCalledWith(sampleData._id, {
        refreshToken: null,
      });
      expect(updateUserSpy).toBeCalledTimes(1);
    });
  });
});
