import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HandlebarsAdapter, MailerModule } from '@nest-modules/mailer';
import { join } from 'path';
import { sendgridConfig } from './configs';
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
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('SMTP_MAIL_HOST'),
          secure: false,
          auth: {
            user: config.get('SMTP_MAIL_USER'),
            pass: config.get('SMTP_MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get('SMTP_MAIL_FROM')}>`,
        },
        preview: true,
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forFeature(sendgridConfig),
  ],
  controllers: [MailController],
  providers: [EmailTemplateRepository, EmailLogRepository, MailService],
  exports: [MailService],
})
export class MailModule {}
