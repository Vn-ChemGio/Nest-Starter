import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserRepository } from './user.repository';

class UserModel {
  public save = jest.fn();
  static create = jest.fn();
  static findById = jest.fn();
  static findByCondition = jest.fn();
  static getByCondition = jest.fn();
  static findAll = jest.fn();
  static aggregate = jest.fn();
  static populate = jest.fn();
  static deleteOne = jest.fn();
  static deleteMany = jest.fn();
  static deleteByCondition = jest.fn();
  static findByConditionAndUpdate = jest.fn();
  static updateMany = jest.fn();
  static findByIdAndUpdate = jest.fn();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
}

const MODEL = 'User';
describe('UserRepository', () => {
  let repository: UserRepository;
  //let model: Model<User>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getModelToken(MODEL),
          useValue: UserModel,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    //model = module.get<Model<User>>(getModelToken('User'));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
