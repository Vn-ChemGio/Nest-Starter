import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EmailTemplateRepository } from './email-template.repository';

class MediaModel {
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

const MODEL = 'EmailTemplate';
describe('EmailTemplateRepository', () => {
  let repository: EmailTemplateRepository;
  //let model: Model<User>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailTemplateRepository,
        {
          provide: getModelToken(MODEL),
          useValue: MediaModel,
        },
      ],
    }).compile();

    repository = module.get<EmailTemplateRepository>(EmailTemplateRepository);
    //model = module.get<Model<User>>(getModelToken('User'));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
