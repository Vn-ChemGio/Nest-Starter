import { Document, Schema } from 'mongoose';
import { preSaveHook } from '../hooks';

const UserSchema = new Schema(
  {
    username: String,
    email: String,
    password: String,
    firstName: String,
    lastName: String,
  },
  {
    collection: 'users',
    timestamps: true,
  },
);

UserSchema.pre<User>('save', preSaveHook);

export { UserSchema };

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
