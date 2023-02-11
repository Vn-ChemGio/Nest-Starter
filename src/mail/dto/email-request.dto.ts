import { IsNotEmpty } from 'class-validator';

export class SendEmailTemplateDto {
  @IsNotEmpty() templateId: string;
  @IsNotEmpty() to: string;
  data: any;
}
