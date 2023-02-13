import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@auth/services';
import { MediaService } from '@media/services';
import { givenUserDataWithId } from '@utils/helpers';

import { UpdateUserPasswordDto } from '../dto';
import { UserService } from '../services';
import { UsersProfileController } from './users-profile.controller';

describe('UsersProfileController', () => {
  let controller: UsersProfileController;
  let userService: UserService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersProfileController],
      providers: [
        {
          provide: UserService,
          useValue: {
            turnOnTwoFactorAuthentication: jest.fn(),
            updateById: jest.fn(),
            changeUserPassword: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
        {
          provide: MediaService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersProfileController>(UsersProfileController);
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call req', async () => {
    const req = {
      user: { email: 'abc@123.com', _id: '123', populated: jest.fn() },
    };
    const findUserByIdSpy = jest
      .spyOn(userService, 'findById')
      .mockResolvedValue(req.user as any);

    expect((await controller.getProfile(req)).email).toBe('abc@123.com');
    expect(findUserByIdSpy).toHaveBeenCalledWith(
      req.user._id,
      'username email firstName lastName avatar createdAt',
    );
    expect(findUserByIdSpy).toHaveBeenCalled();
  });

  describe('changePassword', () => {
    it('should return response same with login', async () => {
      const req = { user: { email: 'abc@123.com', _id: '123' } };
      const sampleData = givenUserDataWithId({ email: req.user.email });
      const sampleBody: UpdateUserPasswordDto = {
        password: sampleData.password,
        newPassword: 'any_samplePass',
        newPasswordConfirm: 'any_samplePass',
      };

      const changeUserPasswordSpy = jest
        .spyOn(userService, 'changeUserPassword')
        .mockResolvedValue({
          email: req.user.email,
        } as any);

      const loginSpy = jest
        .spyOn(authService, 'login')
        .mockResolvedValue(sampleData as any);

      await controller.changePassword(req, sampleBody);

      expect(changeUserPasswordSpy).toHaveBeenCalled();
      expect(changeUserPasswordSpy).toHaveBeenCalledWith(
        req.user._id,
        sampleBody,
      );

      expect(loginSpy).toHaveBeenCalled();
      expect(loginSpy).toHaveBeenCalledWith({
        credential: req.user.email,
        password: sampleBody.newPassword,
      });
    });
  });

  describe('turnOnTwoFactorAuthentication', () => {
    it('should return statusCode in response ', async () => {
      const req = { user: { email: 'abc@123.com', _id: '123' } };

      const updateUserSpy = jest
        .spyOn(userService, 'turnOnTwoFactorAuthentication')
        .mockResolvedValue({} as any);

      await controller.turnOnTwoFactorAuthentication(req);

      expect(updateUserSpy).toHaveBeenCalledWith(req.user._id);
      expect(updateUserSpy).toHaveBeenCalled();
    });
  });
});
