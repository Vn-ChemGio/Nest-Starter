import { Document, Schema } from 'mongoose';
import { preSaveHook } from '../hooks';

const UserSchema = new Schema(
  {
    username: String,
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    refreshToken: String,
    twoFactorAuthenticationSecret: String,
    isTwoFactorAuthenticationEnabled: { type: Boolean, default: false },
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
  twoFactorAuthenticationSecret: string;
  isTwoFactorAuthenticationEnabled: boolean;
  refreshToken: string;
}
