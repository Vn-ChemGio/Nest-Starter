import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsEqualTo } from '../../utils/decorators';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsNotEmpty()
  @Transform(({ value, obj }) =>
    value ? value.toLowerCase() : obj.email.toLowerCase(),
  )
  email: string;
  @IsNotEmpty()
  password: string;

  @IsEqualTo<UpdateUserDto>('password')
  readonly passwordConfirm: string;
}
