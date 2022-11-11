import express from 'express';

const router = express.Router().get('/', async (_, res) => {
  res.sendStatus(204);
});

export default router;
