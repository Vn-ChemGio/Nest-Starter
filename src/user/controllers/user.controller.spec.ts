import {
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  givenUserData,
  givenUserDataWithId,
} from '@utils/helpers/givenUserData';
import { UserService } from '../services';
import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            updateById: jest.fn(),
            removeById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const sampleData = givenUserData();
    const sampleResponse = givenUserDataWithId(sampleData);
    it('It can create user without error', async () => {
      const createUserSpy = jest
        .spyOn(userService, 'create')
        .mockResolvedValue({
          ...sampleResponse,
        });

      const result = await controller.create(sampleData);

      expect(createUserSpy).toHaveBeenCalled();
      expect(createUserSpy).toHaveBeenCalledWith(sampleData);

      expect(result._id).toBeDefined();
    });
    it('It should return an error if create user error', async () => {
      const creatUserSpy = jest
        .spyOn(userService, 'create')
        .mockImplementation(() => {
          throw new HttpException('any_error', HttpStatus.BAD_REQUEST);
        });

      await expect(controller.create(sampleData)).rejects.toEqual(
        new BadRequestException('any_error'),
      );

      expect(creatUserSpy).toHaveBeenCalled();
      expect(creatUserSpy).toBeCalledWith(sampleData);
    });
  });

  describe('findAll', () => {
    const sampleData = [givenUserDataWithId()];
    it('It can find user with default filter and not return an error', async () => {
      const findUserSpy = jest
        .spyOn(userService, 'find')
        .mockResolvedValue(sampleData);

      const result = await controller.findAll();

      expect(findUserSpy).toHaveBeenCalled();
      expect(findUserSpy).toHaveBeenCalledWith({});

      expect(result.length).toBeDefined();
    });
  });

  describe('findById', () => {
    const sampleData = givenUserDataWithId();
    it('It should call findById and return an user without error', async () => {
      const findByIdUserSpy = jest
        .spyOn(userService, 'findById')
        .mockResolvedValue({
          ...sampleData,
        } as any);

      const result = await controller.findById(sampleData._id);

      expect(findByIdUserSpy).toHaveBeenCalled();
      expect(findByIdUserSpy).toHaveBeenCalledWith(sampleData._id, '-password');

      expect(result._id).toBeDefined();
    });

    it('It should call findById and return an error if user does not exist in database', async () => {
      const findByIdUserSpy = jest
        .spyOn(userService, 'findById')
        .mockImplementation(() => {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        });

      await expect(controller.findById(sampleData._id)).rejects.toThrow(
        new NotFoundException('User not found'),
      );

      expect(findByIdUserSpy).toHaveBeenCalled();
      expect(findByIdUserSpy).toHaveBeenCalledWith(sampleData._id, '-password');
    });
  });

  describe('updateById', () => {
    const sampleData = givenUserDataWithId();
    it('It should call updateById not return error', async () => {
      const updateByIdSpy = jest
        .spyOn(userService, 'updateById')
        .mockResolvedValue({ acknowledged: true, modifiedCount: 1 } as any);

      const updateValue = {
        email: 'abc@123.com',
        password: 'xxxx',
        passwordConfirm: 'xxxx2',
      };
      await controller.updateById(sampleData._id, updateValue);

      expect(updateByIdSpy).toHaveBeenCalled();
      expect(updateByIdSpy).toHaveBeenCalledWith(sampleData._id, updateValue);
    });
  });

  describe('removeById', () => {
    const sampleData = givenUserDataWithId();
    it('It should call updateById not return error', async () => {
      const removeByIdSpy = jest
        .spyOn(userService, 'removeById')
        .mockResolvedValue({ acknowledged: true, modifiedCount: 1 } as any);

      await controller.removeById(sampleData._id);

      expect(removeByIdSpy).toHaveBeenCalled();
      expect(removeByIdSpy).toHaveBeenCalledWith(sampleData._id);
    });
  });
});
