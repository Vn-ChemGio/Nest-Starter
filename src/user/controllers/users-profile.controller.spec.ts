import { Test, TestingModule } from '@nestjs/testing';
import { UsersProfileController } from './users-profile.controller';

describe('UsersProfileController', () => {
  let controller: UsersProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersProfileController],
    }).compile();

    controller = module.get<UsersProfileController>(UsersProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call req', async () => {
    const req = { user: { email: 'abc@123.com' } };
    expect((await controller.getProfile(req)).email).toBe('abc@123.com');
  });
});
