import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  givenCredentialWithEmail,
  givenUserData,
  givenUserDataWithId,
} from '@utils/helpers';
import * as bcrypt from 'bcrypt';
import { User } from '../entities';
import { UserRepository } from '../repositories';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
            findByCondition: jest.fn(),
            getByCondition: jest.fn(),
            findById: jest.fn(),
            updateMany: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const sampleData = givenUserData();

    it('It should be completed if email and username does not exist in database', async () => {
      const findByConditionSpy = jest
        .spyOn(repository, 'findByCondition')
        .mockResolvedValue(null);

      const createSpy = jest
        .spyOn(repository, 'create')
        .mockResolvedValue(givenUserDataWithId(sampleData) as any);

      await service.create(sampleData);

      expect(findByConditionSpy).toBeCalledWith({
        $or: [{ email: sampleData.email }, { username: sampleData.username }],
      });
      expect(createSpy).toBeCalledWith(sampleData);
    });

    it('It should return an error if email exists in database then stop process', async () => {
      const findByConditionSpy = jest
        .spyOn(repository, 'findByCondition')
        .mockResolvedValue({
          email: sampleData.email,
        } as User);

      const createSpy = jest.spyOn(repository, 'create').mockResolvedValue({
        _id: '123',
        ...sampleData,
      } as any);

      await expect(service.create(sampleData)).rejects.toEqual(
        new BadRequestException('User already exists'),
      );

      expect(findByConditionSpy).toHaveBeenCalled();
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('It should return an error if username exists in database then stop process', async () => {
      const findByConditionSpy = jest
        .spyOn(repository, 'findByCondition')
        .mockResolvedValue({
          username: sampleData.username,
        } as User);

      const createSpy = jest.spyOn(repository, 'create').mockResolvedValue({
        _id: '123',
        ...sampleData,
      } as any);

      await expect(service.create(sampleData)).rejects.toEqual(
        new BadRequestException('User already exists'),
      );

      expect(findByConditionSpy).toHaveBeenCalled();
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe('find', () => {
    const sampleData = [givenUserDataWithId()];

    it('It should call to getByCondition to get the data with only parameter filter and will not return errors', async () => {
      const getByConditionSpy = jest
        .spyOn(repository, 'getByCondition')
        .mockResolvedValue(sampleData);

      await service.find({});

      expect(getByConditionSpy).toBeCalledWith({}, undefined, undefined);
    });

    it('It should call to getByCondition to get the data with only parameter filter & projection and will not return errors', async () => {
      const getByConditionSpy = jest
        .spyOn(repository, 'getByCondition')
        .mockResolvedValue(sampleData);

      await service.find({}, '-password');

      expect(getByConditionSpy).toBeCalledWith({}, '-password', undefined);
    });

    it('It should call to getByCondition to get the data with only parameter filter, projection & options and will not return errors', async () => {
      const getByConditionSpy = jest
        .spyOn(repository, 'getByCondition')
        .mockResolvedValue(sampleData);

      await service.find({}, '-password', { limit: 1 });

      expect(getByConditionSpy).toBeCalledWith({}, '-password', { limit: 1 });
    });
  });

  describe('findById', () => {
    const sampleData = givenUserDataWithId();

    it('It should call to findById to get the data with only parameter id and will not return errors', async () => {
      const findByIdSpy = jest
        .spyOn(repository, 'findById')
        .mockResolvedValue(sampleData);

      await service.findById(sampleData._id);

      expect(findByIdSpy).toBeCalledWith(sampleData._id, undefined, undefined);
    });

    it('It should call to findById to get the data with only parameter id & projection and will not return errors', async () => {
      const findByIdSpy = jest
        .spyOn(repository, 'findById')
        .mockResolvedValue(sampleData);

      await service.findById(sampleData._id, '-password');

      expect(findByIdSpy).toBeCalledWith(
        sampleData._id,
        '-password',
        undefined,
      );
    });

    it('It should call to findById to get the data with only parameter id & projection, options and will not return errors', async () => {
      const findByIdSpy = jest
        .spyOn(repository, 'findById')
        .mockResolvedValue(sampleData);

      await service.findById(sampleData._id, '-password', { skip: 1 });

      expect(findByIdSpy).toBeCalledWith(sampleData._id, '-password', {
        skip: 1,
      });
    });

    it('It should return an error if userId does not exist in database', async () => {
      const findByIdSpy = jest
        .spyOn(repository, 'findById')
        .mockResolvedValue(null);

      await expect(service.findById(sampleData._id)).rejects.toEqual(
        new NotFoundException('User not found'),
      );

      expect(findByIdSpy).toHaveBeenCalled();
      expect(findByIdSpy).toBeCalledWith(sampleData._id, undefined, undefined);
    });
  });

  describe('findByLogin', () => {
    const sampleData = givenUserDataWithId();
    const credentialWithEmail = givenCredentialWithEmail();

    it('It should return an user if credential & password is valid in database', async () => {
      const password = await bcrypt.hash(sampleData.password, 10);

      const findByConditionSpy = jest
        .spyOn(repository, 'findByCondition')
        .mockResolvedValue({
          _id: '123',
          ...sampleData,
          password: password,
        } as User);

      const result = await service.findByLogin(credentialWithEmail);

      expect(findByConditionSpy).toHaveBeenCalled();
      expect(findByConditionSpy).toBeCalledWith({
        $or: [
          { email: credentialWithEmail.credential },
          { username: credentialWithEmail.credential },
        ],
      });

      expect(result._id).toBeDefined();
    });

    it('It should return an error if credential does not exist in database', async () => {
      const findByConditionSpy = jest
        .spyOn(repository, 'findByCondition')
        .mockResolvedValue(null);

      await expect(service.findByLogin(credentialWithEmail)).rejects.toEqual(
        new UnauthorizedException('User not found'),
      );

      expect(findByConditionSpy).toHaveBeenCalled();
      expect(findByConditionSpy).toBeCalledWith({
        $or: [
          { email: credentialWithEmail.credential },
          { username: credentialWithEmail.credential },
        ],
      });
    });

    it('It should return an user if email exists in database but password is invalid', async () => {
      const password = await bcrypt.hash(sampleData.password + 'xxx', 10);

      const findByConditionSpy = jest
        .spyOn(repository, 'findByCondition')
        .mockResolvedValue({
          _id: '123',
          ...sampleData,
          password: password,
        } as User);

      await expect(service.findByLogin(credentialWithEmail)).rejects.toEqual(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(findByConditionSpy).toHaveBeenCalled();
      expect(findByConditionSpy).toBeCalledWith({
        $or: [
          { email: credentialWithEmail.credential },
          { username: credentialWithEmail.credential },
        ],
      });
    });
  });

  describe('update', () => {
    const sampleResponse = {
      acknowledged: true,
      modifiedCount: 1,
      matchedCount: 1,
    };

    it('It should call to updateMany to get the data with only parameter filter & update and will not return errors', async () => {
      const updateManySpy = jest
        .spyOn(repository, 'updateMany')
        .mockResolvedValue(sampleResponse as any);

      const filter = {};
      const update = {};
      await service.update(filter, update);

      expect(updateManySpy).toBeCalledWith(filter, update, undefined);
    });

    it('It should call to updateMany to get the data with only parameter filter & update & options and will not return errors', async () => {
      const updateManySpy = jest
        .spyOn(repository, 'updateMany')
        .mockResolvedValue(sampleResponse as any);

      const filter = {};
      const update = {};
      const options = {};
      await service.update(filter, update, options);

      expect(updateManySpy).toBeCalledWith(filter, update, options);
    });
  });

  describe('updateById', () => {
    const sampleData = givenUserDataWithId();
    const sampleResponse = { acknowledged: true, modifiedCount: 1 };

    it('It should call to findByIdAndUpdate to get the data and will not return errors', async () => {
      const findByIdAndUpdateSpy = jest
        .spyOn(repository, 'findByIdAndUpdate')
        .mockResolvedValue(sampleResponse as any);

      const update = {};
      await service.updateById(sampleData._id, update);

      expect(findByIdAndUpdateSpy).toBeCalledWith(sampleData._id, update);
    });
  });

  describe('removeById', () => {
    const sampleData = givenUserDataWithId();
    const sampleResponse = { acknowledged: true, modifiedCount: 1 };

    it('It should call to deleteOne and will not return errors', async () => {
      const deleteOneSpy = jest
        .spyOn(repository, 'deleteOne')
        .mockResolvedValue(sampleResponse as any);

      await service.removeById(sampleData._id);

      expect(deleteOneSpy).toBeCalledWith(sampleData._id);
    });
  });
});
