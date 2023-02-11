import { Controller } from '@nestjs/common';
import { MailService } from '../services';

@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}
}
