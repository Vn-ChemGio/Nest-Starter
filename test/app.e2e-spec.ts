import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health-check (GET)', async () => {
    const test = await request(app.getHttpServer())
      .get('/health-check')
      .expect(200);

    expect(test.body.status).toBeDefined();
    expect(['error', 'ok', 'shutting_down']).toContain(test.body.status);

    expect(test.body.info).toBeDefined();
    expect(test.body.error).toBeDefined();
    expect(test.body.details).toBeDefined();
  });
});
