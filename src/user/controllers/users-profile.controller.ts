import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '@auth/services';
import { MediaService } from '@media/services';
import { FilesInterceptor } from '@media/interceptors';
import { UpdateUserPasswordDto, UpdateUserProfileDto } from '../dto';
import { UserService } from '../services';

@Controller('user-profile')
export class UsersProfileController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly mediaService: MediaService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async getProfile(@Req() req: any) {
    const user = await this.userService.findById(
      req.user._id,
      'username email firstName lastName avatar createdAt',
    );
    user.populated('Media');

    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/')
  @UseInterceptors(FilesInterceptor('avatar'))
  async updateProfile(
    @Req() req: any,
    @UploadedFile() file,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    if (file) {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        throw new BadRequestException('Only image files are allowed!');
      }
      const avatar = await this.mediaService.upload(file);
      updateUserProfileDto.avatar = avatar._id;
    }
    return await this.userService.updateById(
      req.user._id,
      updateUserProfileDto,
      { new: true },
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/change-password')
  async changePassword(
    @Req() req: any,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    const user = await this.userService.changeUserPassword(
      req.user._id,
      updateUserPasswordDto,
    );

    return this.authService.login({
      credential: user.email,
      password: updateUserPasswordDto.newPassword,
    });
  }

  @Post('turn-on-2fa')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async turnOnTwoFactorAuthentication(@Req() request: any) {
    await this.userService.turnOnTwoFactorAuthentication(request.user._id);
  }
}
