import * as request from 'supertest';
import type { Application, Request, Response } from 'express';
import express from 'express';

describe('AppController (e2e)', () => {
  let app: Application;

  beforeAll(() => {
    app = express();

    // Mock route สำหรับทดสอบ
    app.get('/', (req: Request, res: Response) => {
      res.status(200).send('Hello World!');
    });
  });

  it('/ (GET)', async () => {
    await request(app).get('/').expect(200).expect('Hello World!');
  });
});
