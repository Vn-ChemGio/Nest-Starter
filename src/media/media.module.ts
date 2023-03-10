import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaSchema } from '@media/entities';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaController } from './controllers';
import { MediaService } from './services';
import { MediaRepository } from '@media/repositories';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Media',
        schema: MediaSchema,
      },
    ]),
    ConfigModule,
  ],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository],
  exports: [MediaService],
})
export class MediaModule {}
