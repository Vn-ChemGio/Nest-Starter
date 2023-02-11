import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from '@utils/repositories';
import { Model } from 'mongoose';
import { EmailTemplate } from '../entities';

@Injectable()
export class EmailTemplateRepository extends BaseRepository<EmailTemplate> {
  constructor(
    @InjectModel('EmailTemplate')
    private readonly emailTemplateModel: Model<EmailTemplate>,
  ) {
    super(emailTemplateModel);
  }
}
