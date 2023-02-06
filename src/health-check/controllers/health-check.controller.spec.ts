import { Test, TestingModule } from '@nestjs/testing';
import {
  HealthCheckResult,
  HealthCheckService,
  HttpHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { HealthCheckController } from './health-check.controller';

describe('HealthCheckController', () => {
  let controller: HealthCheckController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn().mockReturnValue({
              status: 'ok',
              info: { core: { status: 'up' }, mongoose: { status: 'up' } },
              error: {},
              details: { core: { status: 'up' }, mongoose: { status: 'up' } },
            }),
          },
        },
        {
          provide: MongooseHealthIndicator,
          useValue: {
            pingCheck: jest.fn(),
          },
        },
        {
          provide: HttpHealthIndicator,
          useValue: {
            pingCheck: jest.fn(),
          },
        },
      ],
      controllers: [HealthCheckController],
    }).compile();

    controller = module.get<HealthCheckController>(HealthCheckController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('check should be defined', async () => {
    const result = await controller.check();

    expect(result.status).toBeDefined();
    expect(
      ['error', 'ok', 'shutting_down'].includes(result.status),
    ).toBeTruthy();
    expect(result.details).toBeDefined();

    expect(result).toEqual<HealthCheckResult>({
      status: 'ok',
      info: { core: { status: 'up' }, mongoose: { status: 'up' } },
      error: {},
      details: { core: { status: 'up' }, mongoose: { status: 'up' } },
    });
  });
});
