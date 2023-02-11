import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from '@utils/repositories';
import { Model } from 'mongoose';
import { EmailLog } from '../entities';

@Injectable()
export class EmailLogRepository extends BaseRepository<EmailLog> {
  constructor(
    @InjectModel('EmailLog')
    private readonly emailLogModel: Model<EmailLog>,
  ) {
    super(emailLogModel);
  }
}
