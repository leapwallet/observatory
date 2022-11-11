import express, { Express } from 'express';
import { Container } from 'typedi';
import { EnvVars, ProcessEnvVars } from './env-vars';
import morgan from 'morgan';
import { getLogger } from './logger';
import cors from 'cors';
import healthRouter from './routes/health';
import metricsRouter from './routes/metrics';
import { Pinger } from './pinger';
import sleep from './sleep';
import prometheus from 'prom-client';

function setUpHttpLogging(app: Express): void {
  const logger = getLogger('Express.js');
  const handler = morgan('combined', {
    stream: { write: (message) => logger.notice(message) },
  });
  app.use(handler);
}

async function startPinger(): Promise<void> {
  if (EnvVars.getNodeEnv() === 'test') return;
  const pinger = Container.get(Pinger.token);
  const urls = EnvVars.getUrls();
  while (true) {
    urls.forEach((url) => pinger.ping(url));
    await sleep({ ms: 60_000 });
  }
}

Container.set(ProcessEnvVars.token, new ProcessEnvVars.DefaultApi());
const app = express();
setUpHttpLogging(app); // Set up HTTP logging ASAP so that requests get logged.
app.use(cors());
app.use('/health', healthRouter);
app.use('/metrics', metricsRouter);
startPinger();
prometheus.collectDefaultMetrics();
export default app;
