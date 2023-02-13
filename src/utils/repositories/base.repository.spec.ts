import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';

const MODEL = 'MODEL';

describe('BaseRepository', () => {
  let repository: BaseRepository<any>;
  let model: Model<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BaseRepository,
        {
          provide: getModelToken(MODEL),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            updateMany: jest.fn(),
            aggregate: jest.fn(),
            populate: jest.fn(),
            deleteOne: jest.fn(),
            deleteMany: jest.fn(),
          },
        },
      ],
    }).compile();
    model = module.get<Model<any>>(getModelToken(MODEL));
    repository = new BaseRepository<any>(model);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
  /*
  it('should be created new instance and record in database when create', async () => {
    const sampleData = {
      name: 'hantsy',
      email: 'hantsy@example.com',
      password: 'mysecret',
    };

    const object = new ModelExample(sampleData);
    const saveSpy = jest.spyOn(object, 'save').mockResolvedValue({
      _id: '123',
      ...sampleData,
    } as never);

    const result = await repository.create(sampleData);
    expect(saveSpy).toBeCalledWith({ ...sampleData });
    expect(result._id).toBeDefined();
    expect(result.name).toEqual(sampleData.name);
    expect(result.email).toEqual(sampleData.email);
    expect(result.password).toEqual(sampleData.password);
  });
*/

  it('should return a document in database when findById', async () => {
    const sampleData = {
      _id: '123',
      name: 'hantsy',
      email: 'hantsy@example.com',
      password: 'mysecret',
    };
    const findByIdSpy = jest.spyOn(model, 'findById').mockResolvedValue({
      ...sampleData,
    } as any);

    const result = await repository.findById(sampleData._id);
    expect(findByIdSpy).toBeCalledWith(sampleData._id, undefined, undefined);
    expect(findByIdSpy).toBeCalledTimes(1);
    expect(result._id).toEqual(sampleData._id);
    expect(result.name).toEqual(sampleData.name);
    expect(result.email).toEqual(sampleData.email);
    expect(result.password).toEqual(sampleData.password);
  });

  it('should return a document in database when findByCondition', async () => {
    const sampleData = {
      _id: '123',
      name: 'hantsy',
      email: 'hantsy@example.com',
      password: 'mysecret',
    };
    const findByConditionSpy = jest.spyOn(model, 'findOne').mockReturnValue({
      populate: jest.fn().mockReturnValue({ ...sampleData }),
    } as any);

    const result = await repository.findByCondition({});
    expect(findByConditionSpy).toBeCalledWith({}, undefined, undefined);
    expect(findByConditionSpy).toBeCalledTimes(1);
    expect(result._id).toEqual(sampleData._id);
    expect(result.name).toEqual(sampleData.name);
    expect(result.email).toEqual(sampleData.email);
    expect(result.password).toEqual(sampleData.password);
  });

  it('should return a document in database when getByCondition', async () => {
    const sampleData = {
      _id: '123',
      name: 'hantsy',
      email: 'hantsy@example.com',
      password: 'mysecret',
    };
    const findSpy = jest.spyOn(model, 'find').mockReturnValue({
      populate: jest.fn().mockReturnValue([sampleData]),
    } as any);

    const result = await repository.getByCondition({});
    expect(findSpy).toBeCalledWith({}, undefined, undefined);
    expect(findSpy).toBeCalledTimes(1);
    expect(result.length).toBeDefined();

    expect(result[0]._id).toEqual(sampleData._id);
    expect(result[0].name).toEqual(sampleData.name);
    expect(result[0].email).toEqual(sampleData.email);
    expect(result[0].password).toEqual(sampleData.password);
  });

  it('should return arrays document in database when findAll', async () => {
    const sampleData = {
      _id: '123',
      name: 'hantsy',
      email: 'hantsy@example.com',
      password: 'mysecret',
    };

    const data = [sampleData];

    const findSpy = jest.spyOn(model, 'find').mockResolvedValue(data);
    const result = await repository.findAll();
    expect(findSpy).toBeCalledWith();
    expect(findSpy).toBeCalledTimes(1);
    expect(result.length).toBeDefined();
    expect(result.length).toEqual(1);
  });

  it('should return arrays document in database when aggregate', async () => {
    const sampleData = {
      _id: '123',
      name: 'hantsy',
      email: 'hantsy@example.com',
      password: 'mysecret',
    };

    const data = [sampleData];

    const aggregateSpy = jest.spyOn(model, 'aggregate').mockResolvedValue(data);
    await repository.aggregate('any_option');
    expect(aggregateSpy).toBeCalledWith('any_option');
    expect(aggregateSpy).toBeCalledTimes(1);
  });

  it('should return arrays document in database when populate', async () => {
    const sampleData = {
      _id: '123',
      name: 'hantsy',
      email: 'hantsy@example.com',
      password: 'mysecret',
    };

    const data = [sampleData];

    const populateSpy = jest.spyOn(model, 'populate').mockResolvedValue(data);
    await repository.populate(data, 'any_option');
    expect(populateSpy).toBeCalledWith(data, 'any_option');
    expect(populateSpy).toBeCalledTimes(1);
  });

  it('should return arrays document in database when deleteOne', async () => {
    const sampleData = {
      _id: '123',
      name: 'hantsy',
      email: 'hantsy@example.com',
      password: 'mysecret',
    };

    const deleteOneSpy = jest
      .spyOn(model, 'deleteOne')
      .mockResolvedValue({ acknowledged: true, deletedCount: 1 });

    const result = await repository.deleteOne(sampleData._id);
    expect(deleteOneSpy).toBeCalledWith({ _id: sampleData._id });
    expect(deleteOneSpy).toBeCalledTimes(1);
    expect(result.acknowledged).toEqual(true);
    expect(result.deletedCount).toBeDefined();
  });

  it('should return arrays document in database when deleteMany', async () => {
    const sampleData = {
      _id: '123',
      name: 'hantsy',
      email: 'hantsy@example.com',
      password: 'mysecret',
    };

    const deleteManySpy = jest
      .spyOn(model, 'deleteMany')
      .mockResolvedValue({ acknowledged: true, deletedCount: 1 });

    const result = await repository.deleteMany([sampleData._id]);
    expect(deleteManySpy).toBeCalledWith({ _id: { $in: [sampleData._id] } });
    expect(deleteManySpy).toBeCalledTimes(1);
    expect(result.acknowledged).toEqual(true);
    expect(result.deletedCount).toBeDefined();
  });

  it('should return arrays document in database when deleteByCondition', async () => {
    const deleteManySpy = jest
      .spyOn(model, 'deleteMany')
      .mockResolvedValue({ acknowledged: true, deletedCount: 1 });

    const result = await repository.deleteByCondition({});
    expect(deleteManySpy).toBeCalledWith({});
    expect(deleteManySpy).toBeCalledTimes(1);
    expect(result.acknowledged).toEqual(true);
    expect(result.deletedCount).toBeDefined();
  });

  it('should return arrays document in database when findByConditionAndUpdate', async () => {
    const findOneAndUpdateSpy = jest
      .spyOn(model, 'findOneAndUpdate')
      .mockResolvedValue({ acknowledged: true, deletedCount: 1 });

    await repository.findByConditionAndUpdate({}, {});
    expect(findOneAndUpdateSpy).toBeCalledWith({}, {});
    expect(findOneAndUpdateSpy).toBeCalledTimes(1);
  });

  it('should return arrays document in database when findByIdAndUpdate', async () => {
    const sampleData = {
      _id: '123',
      name: 'hantsy',
      email: 'hantsy@example.com',
      password: 'mysecret',
    };

    const findByIdAndUpdateSpy = jest
      .spyOn(model, 'findByIdAndUpdate')
      .mockResolvedValue({ acknowledged: true, modifiedCount: 1 });

    await repository.findByIdAndUpdate(sampleData._id, {});
    expect(findByIdAndUpdateSpy).toBeCalledWith(sampleData._id, {}, undefined);
    expect(findByIdAndUpdateSpy).toBeCalledTimes(1);
  });

  it('should return arrays document in database when updateMany', async () => {
    const updateManySpy = jest.spyOn(model, 'updateMany').mockResolvedValue({
      acknowledged: true,
      modifiedCount: 1,
      matchedCount: 1,
    } as any);

    const result = await repository.updateMany({}, {});
    expect(updateManySpy).toBeCalledWith({}, {}, undefined, undefined);
    expect(updateManySpy).toBeCalledTimes(1);
    expect(result.acknowledged).toEqual(true);
    expect(result.modifiedCount).toBeDefined();
    expect(result.matchedCount).toBeDefined();
  });
});
