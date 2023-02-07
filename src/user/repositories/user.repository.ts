import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from '@utils/repositories';
import { Model } from 'mongoose';
import { User } from '../entities';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
  ) {
    super(userModel);
  }
}
