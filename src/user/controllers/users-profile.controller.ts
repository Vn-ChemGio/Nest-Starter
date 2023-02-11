import {
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '@user/services';

@Controller('profile')
export class UsersProfileController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async getProfile(@Req() req: any) {
    return req.user;
  }

  @Post('turn-on-2fa')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async turnOnTwoFactorAuthentication(@Req() request: any) {
    await this.userService.turnOnTwoFactorAuthentication(request.user._id);
  }
}
