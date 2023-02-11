import { IsNotEmpty } from 'class-validator';

export class CreateEmailTemplateDto {
  @IsNotEmpty() name: string;
  @IsNotEmpty() adapter: string;
  @IsNotEmpty() from: string;
  @IsNotEmpty() subject: string;
  @IsNotEmpty() content: string;
}
