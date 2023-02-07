import { ConfigModule } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController, UsersProfileController } from './controllers';
import { UserSchema } from './entities';
import { UserRepository } from './repositories';
import { UserService } from './services';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UserController, UsersProfileController],
  providers: [UserRepository, UserService],
  exports: [UserService],
})
export class UserModule {}
