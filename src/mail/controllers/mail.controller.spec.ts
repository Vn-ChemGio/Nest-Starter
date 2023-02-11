import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../services';
import { MailController } from './mail.controller';

describe('MailController', () => {
  let controller: MailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MailService,
          useValue: {},
        },
      ],
      controllers: [MailController],
    }).compile();

    controller = module.get<MailController>(MailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
