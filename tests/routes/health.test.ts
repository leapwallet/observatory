import supertest from 'supertest';
import app from '../../src/app';

describe('HTTP GET /health', () => {
  it('must respond with the health check', async () => {
    const { status } = await supertest(app).get('/health');
    expect(status).toBe(204);
  });
});
