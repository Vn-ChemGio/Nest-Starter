import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MailerService } from '@nest-modules/mailer';
import {
  MailDataRequired,
  MailService as SendGridService,
} from '@sendgrid/mail';
import { from, Observable } from 'rxjs';
import { EmailLogRepository, EmailTemplateRepository } from '../repositories';
import { CreateEmailTemplateDto } from '../dto';

@Injectable()
export class MailService {
  constructor(
    private readonly emailTemplateRepository: EmailTemplateRepository,
    private readonly emailLogRepository: EmailLogRepository,
    private readonly mailerService: MailerService,
    @Inject('SENDGRID_MAIL') private sendGridService: SendGridService,
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

  public async removeEmailTemplateById(templateId: string) {
    return this.emailTemplateRepository.deleteOne(templateId);
  }

  public async sendSMTPEmailFromDb(
    templateId: string,
    toEmail: string,
    data: any,
  ) {
    const emailTemplate = await this.findEmailTemplateById(templateId);

    //TODO: Render email by data and template adapter
    const response = await this.mailerService.sendMail({
      to: toEmail,
      from: emailTemplate.from,
      subject: emailTemplate.subject,
      html: emailTemplate.content,
      context: data,
    });

    await this.saveLogSentMail({
      to: toEmail,
      from: emailTemplate.from,
      subject: emailTemplate.subject,
      content: emailTemplate.content,
      status: 'true',
    });

    return response;
  }

  /**
   *
   * @param templateName: a filename had been defined in directory '/src/mail/template'. Ex:'welcome'
   * @param toEmail
   * @param subject
   * @param data
   */
  public sendSMTPEmailFromTemplate(
    templateName: string,
    toEmail: string,
    subject: string,
    data: any,
  ) {
    return this.mailerService.sendMail({
      to: toEmail,
      subject: subject,
      template: `./${templateName}`,
      context: data,
    });
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

  sendGridSendEmail(data: MailDataRequired): Observable<any> {
    //console.log(this.mailService)
    return from(this.sendGridService.send(data, false));
  }
}
