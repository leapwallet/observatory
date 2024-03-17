import supertest from 'supertest';
import app from '../../src/app';

jest.mock('node-cron', () => ({ schedule: jest.fn() }));
jest.mock('../../src/cron/db-cleanup', () => ({
  deletionTask: jest.fn(),
}));
jest.mock('../../src/cron/ecostake-update', () => ({
  deletionTask: jest.fn(),
}));
jest.mock('../../src/cron/singular-update', () => ({
  deletionTask: jest.fn(),
}));

describe('HTTP GET /health', () => {
  it('must respond with the health check', async () => {
    const { status } = await supertest(app).get('/health');
    expect(status).toBe(204);
  });
});
