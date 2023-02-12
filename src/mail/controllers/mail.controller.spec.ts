import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../services';
import { MailController } from './mail.controller';
import { givenEmailTemplate, givenEmailTemplateWithId } from '@utils/helpers/givenEmailTemplate';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';

describe('MailController', () => {
  let controller: MailController;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MailService,
          useValue: {
            createEmailTemplate: jest.fn(),
            removeEmailTemplateById: jest.fn(),
          },
        },
      ],
      controllers: [MailController],
    }).compile();

    controller = module.get<MailController>(MailController);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createEmailTemplate', () => {
    const sampleData = givenEmailTemplate();
    const sampleResponse = givenEmailTemplateWithId(sampleData);
    it('should be call createEmailTemplate without any error', async () => {
      const createEmailTemplateSpy = jest
        .spyOn(mailService, 'createEmailTemplate')
        .mockResolvedValue(sampleResponse);

      const result = await controller.createEmailTemplate(sampleData);

      expect(createEmailTemplateSpy).toHaveBeenCalled();
      expect(createEmailTemplateSpy).toHaveBeenCalledWith(sampleData);
      expect(result).toBeDefined();
    });

    it('It should return an error if create template error', async () => {
      const createEmailTemplateSpy = jest
        .spyOn(mailService, 'createEmailTemplate')
        .mockImplementation(() => {
          throw new HttpException('any_error', HttpStatus.BAD_REQUEST);
        });

      await expect(controller.createEmailTemplate(sampleData)).rejects.toEqual(
        new BadRequestException('any_error'),
      );

      expect(createEmailTemplateSpy).toHaveBeenCalled();
      expect(createEmailTemplateSpy).toHaveBeenCalledWith(sampleData);
    });
  });

  describe('removeEmailTemplate', () => {
    const sampleData = givenEmailTemplateWithId();
    it('should be call removeEmailTemplate without any error', async () => {
      const removeEmailTemplateSpy = jest
        .spyOn(mailService, 'removeEmailTemplateById')
        .mockResolvedValue({
          acknowledged: true,
          modifiedCount: 1,
        } as any);

      const result = await controller.removeEmailTemplate(sampleData._id);

      expect(removeEmailTemplateSpy).toHaveBeenCalled();
      expect(removeEmailTemplateSpy).toHaveBeenCalledWith(sampleData._id);
      expect(result).toBeDefined();
    });
  });
});
