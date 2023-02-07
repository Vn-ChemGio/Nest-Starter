import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('profile')
export class UsersProfileController {
  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async getProfile(@Req() req: any) {
    return req.user;
  }
}
