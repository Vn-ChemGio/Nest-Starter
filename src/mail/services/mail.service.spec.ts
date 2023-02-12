import {
  BadRequestException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nest-modules/mailer';
import { MailService as SendGridService } from '@sendgrid/mail';
import {
  givenEmailTemplate,
  givenEmailTemplateWithId,
} from '@utils/helpers/givenEmailTemplate';
import { EmailLogRepository, EmailTemplateRepository } from '../repositories';
import { MailService } from './mail.service';

const SENDGRID_MAIL = 'SENDGRID_MAIL';
describe('MailService', () => {
  let service: MailService;
  let emailTemplateRepository: EmailTemplateRepository;
  let emailLogRepository: EmailLogRepository;
  let mailerService: MailerService;
  let sendGridService: SendGridService;

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
            deleteOne: jest.fn(),
          },
        },
        {
          provide: EmailLogRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: SENDGRID_MAIL,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    emailTemplateRepository = module.get<EmailTemplateRepository>(
      EmailTemplateRepository,
    );
    emailLogRepository = module.get<EmailLogRepository>(EmailLogRepository);
    mailerService = module.get<MailerService>(MailerService);
    sendGridService = module.get<SendGridService>(SENDGRID_MAIL);
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

  describe('removeEmailTemplateById', () => {
    const sampleData = givenEmailTemplateWithId();
    it('It should complete without error', async () => {
      const deleteOneSpy = jest
        .spyOn(emailTemplateRepository, 'deleteOne')
        .mockReturnValue({
          acknowledged: true,
          modifiedCount: 1,
        } as any);

      const response = await service.removeEmailTemplateById(sampleData._id);

      expect(deleteOneSpy).toHaveBeenCalledWith(sampleData._id);
      expect(deleteOneSpy).toHaveBeenCalled();
      expect(response).toBeTruthy();
    });
  });

  describe('sendSMTPEmailFromDb', () => {
    const emailTemplate = givenEmailTemplateWithId();

    const target = 'target@abc.com';
    const data = {};
    it('should return completed if everything is correctly', async () => {
      const findEmailTemplateByIdSpy = jest
        .spyOn(emailTemplateRepository, 'findById')
        .mockResolvedValue(emailTemplate as any);

      const sendEmailSpy = jest
        .spyOn(mailerService, 'sendMail')
        .mockResolvedValue({} as any);

      const saveLogSpy = jest
        .spyOn(emailLogRepository, 'create')
        .mockResolvedValue({} as any);

      const result = await service.sendSMTPEmailFromDb(
        emailTemplate._id,
        target,
        data,
      );

      expect(findEmailTemplateByIdSpy).toHaveBeenCalled();
      expect(findEmailTemplateByIdSpy).toHaveBeenCalledWith(emailTemplate._id);

      expect(sendEmailSpy).toHaveBeenCalled();
      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: target,
        from: emailTemplate.from,
        subject: emailTemplate.subject,
        html: emailTemplate.content,
        context: data,
      });

      expect(saveLogSpy).toHaveBeenCalled();
      expect(saveLogSpy).toHaveBeenCalledWith({
        to: target,
        from: emailTemplate.from,
        subject: emailTemplate.subject,
        content: emailTemplate.content,
        status: 'true',
      });

      expect(result).toBeDefined();
    });

    it('should return an error if data is invalid', async () => {
      const findEmailTemplateByIdSpy = jest
        .spyOn(emailTemplateRepository, 'findById')
        .mockImplementation(() => {
          throw new HttpException('any_error', HttpStatus.BAD_REQUEST);
        });

      await expect(
        service.sendSMTPEmailFromDb(emailTemplate._id, 'any_email', undefined),
      ).rejects.toEqual(new BadRequestException('any_error'));

      expect(findEmailTemplateByIdSpy).toHaveBeenCalledWith(emailTemplate._id);
      expect(findEmailTemplateByIdSpy).toHaveBeenCalled();
    });
  });

  describe('sendSMTPEmailFromTemplate', () => {
    const emailTemplate = givenEmailTemplateWithId();
    const target = 'target@abc.com';
    const data = {};
    it('should return completed if everything is correctly', async () => {
      const sendEmailSpy = jest
        .spyOn(mailerService, 'sendMail')
        .mockResolvedValue({} as any);

      const result = await service.sendSMTPEmailFromTemplate(
        'welcome',
        target,
        emailTemplate.subject,
        data,
      );

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: target,
        subject: emailTemplate.subject,
        template: `./welcome`,
        context: data,
      });
      expect(sendEmailSpy).toHaveBeenCalled();
      expect(result).toBeDefined();
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

  describe('sendGridSendEmail', () => {
    it('should call SendGridService.send', async () => {
      const msg = {
        to: 'test@example.com',
        from: 'test@example.com', // Use the email address or domain you verified above
        subject: 'Sending with Twilio SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
      };

      const sendSpy = jest
        .spyOn(sendGridService, 'send')
        .mockResolvedValue({} as any);

      await service.sendGridSendEmail(msg).toPromise();
      expect(sendSpy).toHaveBeenCalled();
      expect(sendSpy).toBeCalledWith(msg, false);
    });
  });
});
