import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  givenEmailTemplate,
  givenEmailTemplateWithId,
} from '@utils/helpers/givenEmailTemplate';
import { EmailLogRepository, EmailTemplateRepository } from '../repositories';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;
  let emailTemplateRepository: EmailTemplateRepository;
  let emailLogRepository: EmailLogRepository;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: EmailTemplateRepository,
          useValue: {
            create: jest.fn(),
            findByCondition: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: EmailLogRepository,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    emailTemplateRepository = module.get<EmailTemplateRepository>(
      EmailTemplateRepository,
    );
    emailLogRepository = module.get<EmailLogRepository>(EmailLogRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEmailTemplate', () => {
    const sampleData = givenEmailTemplate();
    it('It should be completed if name does not exist in database', async () => {
      const findByConditionSpy = jest
        .spyOn(emailTemplateRepository, 'findByCondition')
        .mockResolvedValue(null);

      const createSpy = jest
        .spyOn(emailTemplateRepository, 'create')
        .mockResolvedValue({
          _id: '123',
          ...sampleData,
        } as any);

      const result = await service.createEmailTemplate(sampleData);

      expect(findByConditionSpy).toBeCalled();
      expect(findByConditionSpy).toBeCalledWith({ name: sampleData.name });
      expect(findByConditionSpy).toBeCalledTimes(1);

      expect(createSpy).toBeCalled();
      expect(createSpy).toBeCalledWith(sampleData);

      expect(result._id).toBeDefined();
    });

    it('It should return an error if name exists in database', async () => {
      const findByConditionSpy = jest
        .spyOn(emailTemplateRepository, 'findByCondition')
        .mockResolvedValue({
          name: sampleData.name,
        } as any);

      const createSpy = jest.spyOn(emailTemplateRepository, 'create');

      await expect(service.createEmailTemplate(sampleData)).rejects.toEqual(
        new BadRequestException('Name had been used!'),
      );
      expect(findByConditionSpy).toBeCalled();
      expect(findByConditionSpy).toBeCalledWith({ name: sampleData.name });

      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe('findEmailTemplateById', () => {
    const sampleData = givenEmailTemplateWithId();
    it('It should be completed if data is valid', async () => {
      const findByIdSpy = jest
        .spyOn(emailTemplateRepository, 'findById')
        .mockResolvedValue({
          ...sampleData,
        } as any);

      const result = await service.findEmailTemplateById(sampleData._id);

      expect(findByIdSpy).toBeCalledWith(sampleData._id);
      expect(findByIdSpy).toBeCalledTimes(1);

      expect(result._id).toBeDefined();
      expect(result._id).toEqual(sampleData._id);
    });

    it('It should return an error if id does not exist in database', async () => {
      const findByIdSpy = jest
        .spyOn(emailTemplateRepository, 'findById')
        .mockResolvedValue(null);

      await expect(
        service.findEmailTemplateById(sampleData._id),
      ).rejects.toEqual(new BadRequestException('Invalid Template Id'));

      expect(findByIdSpy).toBeCalledWith(sampleData._id);
      expect(findByIdSpy).toBeCalledTimes(1);
    });

    it('It should return an error if id exists in database but data invalid', async () => {
      const findByIdSpy = jest
        .spyOn(emailTemplateRepository, 'findById')
        .mockResolvedValue({
          _id: sampleData._id,
        } as any);

      await expect(
        service.findEmailTemplateById(sampleData._id),
      ).rejects.toEqual(
        new InternalServerErrorException('Invalid Template Data'),
      );

      expect(findByIdSpy).toBeCalledWith(sampleData._id);
      expect(findByIdSpy).toBeCalledTimes(1);
    });
  });

  describe('saveLogSentMail', () => {
    it('it should create new log without error', async () => {
      const sampleData = {
        from: 'data.from',
        to: 'data.to',
        subject: 'data.subject',
        content: 'data.content',
        status: 'data.status',
      };
      const createSpy = jest
        .spyOn(emailLogRepository, 'create')
        .mockResolvedValue({
          _id: '123',
          ...sampleData,
        } as any);

      const result = await service.saveLogSentMail(sampleData);

      expect(createSpy).toBeCalledWith(sampleData);
      expect(createSpy).toBeCalledTimes(1);

      expect(result._id).toBeDefined();

      expect(service).toBeDefined();
    });
  });
});
