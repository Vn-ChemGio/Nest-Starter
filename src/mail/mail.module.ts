import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailController } from './controllers';
import { EmailLogSchema, EmailTemplateSchema } from './entities';
import { MailService } from './services';
import { EmailLogRepository, EmailTemplateRepository } from './repositories';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'EmailTemplate',
        schema: EmailTemplateSchema,
      },
    ]),

    MongooseModule.forFeature([
      {
        name: 'EmailLog',
        schema: EmailLogSchema,
      },
    ]),
  ],
  controllers: [MailController],
  providers: [EmailTemplateRepository, EmailLogRepository, MailService],
})
export class MailModule {}
