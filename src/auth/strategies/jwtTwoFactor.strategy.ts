import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../services';

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
  Strategy,
  'jwt-two-factor',
) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRETKEY,
      ignoreExpiration: true,
    });
  }

  async validate({ _id, isSecondFactorAuthenticated }) {
    if (!_id) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.authService.validateUser(_id);

    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    if (user.isTwoFactorAuthenticationEnabled && !isSecondFactorAuthenticated) {
      throw new HttpException('Permission denied', HttpStatus.FORBIDDEN);
    }

    return user;
  }
}
