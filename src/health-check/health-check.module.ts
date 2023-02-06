import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthCheckController } from './controllers';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthCheckController],
})
export class HealthCheckModule {}
