import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@user/services';
import { CreateUserDto } from '@user/dto';
import { User } from '@user/entities';
import { LoginUserDto } from '@auth/dto';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(userDto: CreateUserDto) {
    const user = await this.userService.create(userDto);
    const token = await this._createToken(user);
    return {
      email: user.email,
      ...token,
    };
  }

  async login(loginAuthDto: LoginUserDto) {
    const user = await this.userService.findByLogin(loginAuthDto);
    const token = await this._createToken(user as any);

    return {
      email: user.email,
      ...token,
    };
  }

  async validateUser(id: string) {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verify(refreshToken, {
        secret: process.env.SECRETKEY_REFRESH,
      });
      const user = await this.userService.getUserByRefresh(
        refreshToken,
        payload.id,
      );
      const token = await this._createToken(user as any, true, false);
      return {
        email: user.email,
        ...token,
      };
    } catch (e) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }

  async getAccess2FA(user) {
    return this._createToken(user, true);
  }

  async pipeQrCodeStream(stream: Response, otpAuthUrl: string) {
    return toFileStream(stream, otpAuthUrl);
  }

  async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(
      user.email,
      this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'),
      secret,
    );
    await this.userService.setTwoFactorAuthenticationSecret(secret, user._id);
    return {
      secret,
      otpAuthUrl,
    };
  }

  async isTwoFactorAuthenticationCodeValid(code, user) {
    return authenticator.verify({
      token: code,
      secret: user.twoFactorAuthenticationSecret,
    });
  }

  logout(user: User) {
    return this.userService.updateById(user._id, { refreshToken: null });
  }

  private async _createToken(
    { _id },
    isSecondFactorAuthenticated = false,
    refresh = true,
  ) {
    const accessToken = this.jwtService.sign({
      id: _id,
      isSecondFactorAuthenticated,
    });
    if (refresh) {
      const refreshToken = this.jwtService.sign(
        { id: _id },
        {
          secret: process.env.SECRETKEY_REFRESH,
          expiresIn: process.env.EXPIRESIN_REFRESH,
        },
      );
      await this.userService.updateById(_id, { refreshToken: refreshToken });
      return {
        expiresIn: process.env.EXPIRESIN,
        accessToken,
        refreshToken,
        expiresInRefresh: process.env.EXPIRESIN_REFRESH,
      };
    } else {
      return {
        expiresIn: process.env.EXPIRESIN,
        accessToken,
      };
    }
  }
}
