import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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

  @Post('refresh')
  async refresh(@Body() body) {
    return await this.authService.refresh(body.refresh_token);
  }

  @Post('generate')
  @UseGuards(AuthGuard('jwt'))
  async generate(@Res() response: any, @Req() request: any) {
    const { otpAuthUrl } =
      await this.authService.generateTwoFactorAuthenticationSecret(
        request.user,
      );

    return this.authService.pipeQrCodeStream(response, otpAuthUrl);
  }

  @Post('authenticate')
  @UseGuards(AuthGuard('jwt'))
  async authentication(@Req() request: any, @Body('code') code) {
    const isCodeValid =
      await this.authService.isTwoFactorAuthenticationCodeValid(
        code,
        request.user,
      );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    return this.authService.getAccess2FA(request.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Req() req: any) {
    await this.authService.logout(req.user);
    return {
      statusCode: 200,
    };
  }
}
