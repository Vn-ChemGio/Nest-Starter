import { Body, Controller, Post } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from '@auth/dto';
import { AuthService } from '@auth/services';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: RegisterUserDto) {
    return await this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.login(loginUserDto);
  }
}
