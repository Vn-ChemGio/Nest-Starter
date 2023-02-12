import { registerAs } from '@nestjs/config';

export const sendgridConfig = registerAs('sendgrid', () => ({
  apiKey: process.env.SENDGRID_API_KEY || 'SG.test',
}));
