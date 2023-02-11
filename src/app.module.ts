import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthCheckModule } from './health-check';
import { UserModule } from '@user/';
import { AuthModule } from '@auth/';
import { MediaModule } from '@media/';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    HealthCheckModule,
    UserModule,
    AuthModule,
    MediaModule,
  ],
})
export class AppModule {}
