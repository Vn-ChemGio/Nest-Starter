import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { IsEqualTo, IsNotEqualTo } from '@utils/decorators';

export class UpdateUserProfileDto extends PartialType(CreateUserDto) {
  @Transform(({ value }) => value.toLowerCase())
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
}
export class UpdateUserPasswordDto {
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsNotEqualTo<UpdateUserPasswordDto>('password')
  newPassword: string;

  @IsEqualTo<UpdateUserPasswordDto>('newPassword')
  readonly newPasswordConfirm: string;
}
