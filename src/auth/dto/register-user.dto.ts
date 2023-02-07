import { IsEqualTo } from '@utils/decorators';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty()
  @Transform(({ value, obj }) =>
    value ? value.toLowerCase() : obj.email.toLowerCase(),
  )
  username?: string;

  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsNotEmpty()
  password: string;

  @IsEqualTo<RegisterUserDto>('password')
  readonly passwordConfirm: string;

  firstName?: string;
  lastName?: string;
}
