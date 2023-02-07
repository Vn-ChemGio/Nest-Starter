import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@user/services';
import { CreateUserDto } from '@user/dto';
import { LoginUserDto } from '@auth/dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(userDto: CreateUserDto) {
    const user = await this.userService.create(userDto);
    const token = this._createToken(user);
    return {
      email: user.email,
      ...token,
    };
  }

  async login(loginAuthDto: LoginUserDto) {
    const user = await this.userService.findByLogin(loginAuthDto);
    const token = this._createToken(user as any);

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

  private _createToken({ _id }): any {
    const accessToken = this.jwtService.sign({ id: _id });
    return {
      expiresIn: process.env.EXPIRESIN,
      accessToken,
    };
  }
}
