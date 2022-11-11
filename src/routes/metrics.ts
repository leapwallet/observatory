import express from 'express';
import prometheus from 'prom-client';

const router = express.Router().get('/', async (_, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});

export default router;
