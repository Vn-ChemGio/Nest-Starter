import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsNotEmpty()
  password: string;

  @Transform(({ value }) => value.toLowerCase())
  username?: string;
  firstName?: string;
  lastName?: string;
}
