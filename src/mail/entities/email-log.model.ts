import { Document, Schema } from 'mongoose';

const EmailLogSchema = new Schema(
  {
    from: String,
    to: String,
    subject: String,
    content: String,
    status: String,
  },
  {
    collection: 'email__logs',
    timestamps: true,
  },
);

export { EmailLogSchema };

export interface EmailLog extends Document {
  from: string;
  to: string;
  subject: string;
  content: string;
  status: string;
}
