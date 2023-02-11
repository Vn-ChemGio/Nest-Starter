import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from '@utils/repositories';
import { Model } from 'mongoose';
import { Media } from '../entities';

@Injectable()
export class MediaRepository extends BaseRepository<Media> {
  constructor(
    @InjectModel('Media')
    private readonly mediaModel: Model<Media>,
  ) {
    super(mediaModel);
  }
}
