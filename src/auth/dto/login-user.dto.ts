import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  credential: string;
  @IsNotEmpty() password: string;
}
