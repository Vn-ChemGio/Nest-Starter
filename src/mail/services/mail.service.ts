import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EmailLogRepository, EmailTemplateRepository } from '../repositories';
import { CreateEmailTemplateDto } from '../dto';

@Injectable()
export class MailService {
  constructor(
    private readonly emailTemplateRepository: EmailTemplateRepository,
    private readonly emailLogRepository: EmailLogRepository,
  ) {}

  public async createEmailTemplate(data: CreateEmailTemplateDto) {
    const emailTemplate = await this.emailTemplateRepository.findByCondition({
      name: data.name,
    });

    if (emailTemplate) {
      throw new BadRequestException('Name had been used!');
    }

    return this.emailTemplateRepository.create(data);
  }

  public async findEmailTemplateById(templateId: string) {
    const emailTemplate = await this.emailTemplateRepository.findById(
      templateId,
    );

    if (!emailTemplate) {
      throw new NotFoundException('Invalid Template Id');
    }

    if (!emailTemplate.from || !emailTemplate.subject || !emailTemplate.content)
      throw new InternalServerErrorException('Invalid Template Data');

    return emailTemplate;
  }

  public async saveLogSentMail(data: any) {
    return this.emailLogRepository.create({
      from: data.from,
      to: data.to,
      subject: data.subject,
      content: data.content,
      status: data.status,
    });
  }
}
