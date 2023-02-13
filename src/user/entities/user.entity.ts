import { Document, Schema } from 'mongoose';
import { preSaveHook } from '../hooks';

const UserSchema = new Schema(
  {
    username: String,
    email: String,
    password: String,
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    avatar: { type: Schema.Types.ObjectId, ref: 'Media', default: null },
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
  avatar: string;
  twoFactorAuthenticationSecret: string;
  isTwoFactorAuthenticationEnabled: boolean;
  refreshToken: string;
}
