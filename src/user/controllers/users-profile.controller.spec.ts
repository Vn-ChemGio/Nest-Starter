import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@user/services';
import { UsersProfileController } from './users-profile.controller';

describe('UsersProfileController', () => {
  let controller: UsersProfileController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersProfileController],
      providers: [
        {
          provide: UserService,
          useValue: {
            turnOnTwoFactorAuthentication: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersProfileController>(UsersProfileController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call req', async () => {
    const req = { user: { email: 'abc@123.com' } };
    expect((await controller.getProfile(req)).email).toBe('abc@123.com');
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
