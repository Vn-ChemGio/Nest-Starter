import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import * as process from 'process';

@Controller('health-check')
export class HealthCheckController {
  constructor(
    private health: HealthCheckService,
    private mongoDb: MongooseHealthIndicator,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () =>
        this.http.pingCheck(
          'core',
          process.env.CORE_API_HOST || 'https://docs.nestjs.com',
        ),
      () => this.mongoDb.pingCheck('mongoose', { timeout: 1000 }),
    ]);
  }
}
