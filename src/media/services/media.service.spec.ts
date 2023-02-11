import { NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { MediaRepository } from '../repositories';
import { Media } from '../entities';

describe('MediaService', () => {
  let service: MediaService;
  let repository: MediaRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        MediaService,
        {
          provide: MediaRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    repository = module.get<MediaRepository>(MediaRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLinkFile', () => {
    const media_id = 'anyId';
    it('It should complete without error', async () => {
      const findByIdSpy = jest.spyOn(repository, 'findById').mockResolvedValue({
        key: 'any_key',
      } as Media);

      const response = await service.getLinkFile(media_id);

      expect(findByIdSpy).toHaveBeenCalledWith(media_id);
      expect(findByIdSpy).toHaveBeenCalled();
      expect(response).toBeDefined();
    });

    it('It should return an error if file does not exist', async () => {
      const findByIdSpy = jest
        .spyOn(repository, 'findById')
        .mockResolvedValue(null);

      await expect(service.getLinkFile(media_id)).rejects.toEqual(
        new NotFoundException("File doesn't exists"),
      );

      expect(findByIdSpy).toHaveBeenCalledWith(media_id);
      expect(findByIdSpy).toHaveBeenCalled();
    });
  });

  describe('updateACL', () => {
    const media_id = 'anyId';
    it('It should complete without error', async () => {
      const findByIdSpy = jest.spyOn(repository, 'findById').mockResolvedValue({
        key: 'any_key',
      } as Media);

      const response = await service.updateACL(media_id);

      expect(findByIdSpy).toHaveBeenCalledWith(media_id);
      expect(findByIdSpy).toHaveBeenCalled();
      expect(response).toBeTruthy();
    });

    it('It should return an error if file does not exist', async () => {
      const findByIdSpy = jest
        .spyOn(repository, 'findById')
        .mockResolvedValue(null);

      await expect(service.updateACL(media_id)).rejects.toEqual(
        new NotFoundException("File doesn't exists"),
      );

      expect(findByIdSpy).toHaveBeenCalledWith(media_id);
      expect(findByIdSpy).toHaveBeenCalled();
    });
  });

  describe('deleteFileS3', () => {
    const media_id = 'anyId';
    it('It should complete without error', async () => {
      const findByIdSpy = jest.spyOn(repository, 'findById').mockImplementation(
        () =>
          ({
            key: 'any_key',
            remove: jest.fn(),
          } as any),
      );

      const response = await service.deleteFileS3(media_id);

      expect(findByIdSpy).toHaveBeenCalledWith(media_id);
      expect(findByIdSpy).toHaveBeenCalled();
      expect(response).toBeTruthy();
    });

    it('It should return an error if file does not exist', async () => {
      const findByIdSpy = jest
        .spyOn(repository, 'findById')
        .mockResolvedValue(null);

      await expect(service.deleteFileS3(media_id)).rejects.toEqual(
        new NotFoundException("File doesn't exists"),
      );

      expect(findByIdSpy).toHaveBeenCalledWith(media_id);
      expect(findByIdSpy).toHaveBeenCalled();
    });
  });
});
