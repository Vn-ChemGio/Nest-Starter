import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from '../services';
describe('MediaController', () => {
  let controller: MediaController;
  let service: MediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: MediaService,
          useValue: {
            getLinkFile: jest.fn(),
            upload: jest.fn(),
            updateACL: jest.fn(),
            deleteFileS3: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
    service = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findOne should be defined', async () => {
    const fileId = 'any_key';

    const getLinkMediaKeySpy = jest
      .spyOn(service, 'getLinkFile')
      .mockResolvedValue('any_URL' as never);

    const result = await controller.findOne(fileId);
    expect(getLinkMediaKeySpy).toHaveBeenCalledWith(fileId);
    expect(getLinkMediaKeySpy).toHaveBeenCalled();

    expect(result).toBeDefined();
  });

  it('updateACL should be defined', async () => {
    const fileId = 'any_key';

    const updateAclSpy = jest
      .spyOn(service, 'updateACL')
      .mockResolvedValue('any_URL' as never);

    const result = await controller.updateACL(fileId);
    expect(updateAclSpy).toHaveBeenCalledWith(fileId);
    expect(updateAclSpy).toHaveBeenCalled();

    expect(result).toBeDefined();
  });

  it('remove should be defined', async () => {
    const fileId = 'any_key';

    const deleteFileS3Spy = jest
      .spyOn(service, 'deleteFileS3')
      .mockResolvedValue('any_URL' as never);

    const result = await controller.remove(fileId);
    expect(deleteFileS3Spy).toHaveBeenCalledWith(fileId);
    expect(deleteFileS3Spy).toHaveBeenCalled();

    expect(result).toBeDefined();
  });
});
