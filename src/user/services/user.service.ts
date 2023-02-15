import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginUserDto } from '@auth/dto';
import * as bcrypt from 'bcrypt';
import {
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import { CreateUserDto, UpdateUserPasswordDto } from '../dto';
import { UserRepository } from '../repositories';
import { User } from '../entities';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto) {
    const userInDb = await this.userRepository.findByCondition({
      $or: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });
    if (userInDb) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    return await this.userRepository.create(createUserDto);
  }

  find(
    filter: FilterQuery<User>,
    projection?: ProjectionType<User>,
    options?: QueryOptions<User>,
  ) {
    return this.userRepository.getByCondition(filter, projection, options);
  }

  async findById(
    id: string,
    projection?: ProjectionType<User>,
    option?: QueryOptions<User>,
  ) {
    const user = await this.userRepository.findById(id, projection, option);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async findByLogin({ credential, password }: LoginUserDto) {
    const user = await this.userRepository.findByCondition({
      $or: [{ email: credential }, { username: credential }],
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    const is_equal = bcrypt.compareSync(password, user.password);

    if (!is_equal) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  async getUserByRefresh(refreshToken: string, id: string) {
    const user = await this.userRepository.findById(id, '-password');
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    const is_equal = await bcrypt.compare(
      this.reverse(refreshToken),
      user.refreshToken,
    );

    if (!is_equal) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  async setTwoFactorAuthenticationSecret(secret, userId) {
    return this.userRepository.findByIdAndUpdate(userId, {
      twoFactorAuthenticationSecret: secret,
    });
  }

  async turnOnTwoFactorAuthentication(userId: string) {
    return this.userRepository.findByIdAndUpdate(userId, {
      isTwoFactorAuthenticationEnabled: true,
    });
  }

  update(
    filter: FilterQuery<User>,
    update: UpdateQuery<User>,
    option?: QueryOptions<User>,
  ) {
    return this.userRepository.updateMany(filter, update, option);
  }

  async updateById(
    id: string,
    update: UpdateQuery<User>,
    options?: QueryOptions<User>,
  ) {
    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }
    if (update.refreshToken) {
      update.refreshToken = await bcrypt.hash(
        this.reverse(update.refreshToken),
        10,
      );
    }
    if (update.email) {
      update.email = update.email.toLowerCase();
    }

    if (update.username) {
      update.username = update.username.toLowerCase();
    }

    return this.userRepository.findByIdAndUpdate(id, update, options);
  }

  async changeUserPassword(
    id: string,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const is_equal = bcrypt.compareSync(
      updateUserPasswordDto.password,
      user.password,
    );

    if (!is_equal) {
      throw new BadRequestException('Invalid credentials');
    }

    user.password = updateUserPasswordDto.newPassword;
    return user.save();
  }

  removeById(id: string) {
    return this.userRepository.deleteOne(id);
  }

  reverse(s) {
    return s.split('').reverse().join('');
  }
}
