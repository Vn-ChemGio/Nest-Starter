import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { CreateEmailTemplateDto } from '../dto';
import { MailService } from '../services';
@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('/smtp-email-templates')
  createEmailTemplate(@Body() emailTemplateDto: CreateEmailTemplateDto) {
    return this.mailService.createEmailTemplate(emailTemplateDto);
  }

  @Delete('/smtp-email-templates/:id')
  async removeEmailTemplate(@Param('id') id: string) {
    await this.mailService.removeEmailTemplateById(id);
    return true;
  }
}
