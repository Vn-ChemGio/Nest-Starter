import { Document, Schema } from 'mongoose';

const EmailTemplateSchema = new Schema(
  {
    name: String,
    adapter: String,
    from: String,
    subject: String,
    content: String,
  },
  {
    collection: 'email__templates',
    timestamps: true,
  },
);

export { EmailTemplateSchema };

export interface EmailTemplate extends Document {
  name: string;
  adapter: 'hbs' | 'ejs' | 'pug';
  from: string;
  subject: string;
  content: string;
}
