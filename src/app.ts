import express, { Express } from 'express';
import { Container } from 'typedi';
import { EnvVars, ProcessEnvVars } from './env-vars';
import morgan from 'morgan';
import { getLogger } from './logger';
import cors from 'cors';
import healthRouter from './routes/health';
import metricsRouter from './routes/metrics';
import { Pinger } from './pinger';
import { CosmosPinger } from './blockchain-node-urls/pinger';
import { HealthyNodes } from './blockchain-node-urls/healthyNodes';
import sleep from './sleep';
import prometheus from 'prom-client';
import { CosmosBlockchain } from './types';
import { BlockchainNodeUrlGetter } from './blockchain-node-urls/getter';

function setUpHttpLogging(app: Express): void {
  const logger = getLogger('Express.js');
  const handler = morgan('combined', {
    stream: { write: (message) => logger.notice(message) },
  });
  app.use(handler);
}

// @ts-ignore
async function startPinger(): Promise<void> {
  if (EnvVars.getNodeEnv() === 'test') return;
  const pinger = Container.get(Pinger.token);
  const chainNodeList = EnvVars.readUrls();
  while (true) {
    for (const chainNodeMap of chainNodeList) {
      for (const nodeUrl of chainNodeMap.nodeList) {
        pinger.ping(nodeUrl, chainNodeMap.chainName);
      }
    }
    await sleep({ ms: 60_000 });
  }
}

async function startEcostakePinger(): Promise<void> {
  if (EnvVars.getNodeEnv() === 'test') return;
  const pinger = Container.get(Pinger.token);
  const chainNodeList = EnvVars.readUrls();
  const ecostakeChains = chainNodeList.filter((chain) => chain.isEcostakeChain);
  const logger = getLogger(__filename);
  while (true) {
    for (const chain of ecostakeChains) {
      const chainName = chain.chainName as CosmosBlockchain;
      // const url = `https://rest-${chain.toLowerCase()}.ecostake.com/`
      const url = `https://rest.cosmos.directory/${chainName.toLowerCase()}`;
      // console.log(url)
      pinger.ping(url, chainName);
    }
    const t = 60_000;
    await sleep({ ms: t });
    logger.informational(`Waiting for ${t} ms`);
  }
}

async function startCosmosPinger(): Promise<void> {
  if (EnvVars.getNodeEnv() === 'test') return;
  const healthyNodesFetcher = Container.get(HealthyNodes.token);
  const chainNodeList = EnvVars.readUrls();
  healthyNodesFetcher.startHealthyNodeFetcher(chainNodeList);

  const pinger = Container.get(CosmosPinger.token);
  const blockchainNodeUrlGetter = Container.get(BlockchainNodeUrlGetter.token);
  blockchainNodeUrlGetter.setUrlIndices(chainNodeList);
  const logger = getLogger(__filename);
  while (true) {
    for (const chainNodeMap of chainNodeList) {
      pinger.ping(chainNodeMap.chainName as CosmosBlockchain);
    }
    const t = 60_000;
    await sleep({ ms: t });
    logger.informational(`Waiting for ${t} ms`);
  }
}

Container.set(ProcessEnvVars.token, new ProcessEnvVars.DefaultApi());
const app = express();
setUpHttpLogging(app); // Set up HTTP logging ASAP so that requests get loggedd.
app.use(cors());
app.use('/health', healthRouter);
app.use('/metrics', metricsRouter);
// startPinger();
startEcostakePinger();
startCosmosPinger();
prometheus.collectDefaultMetrics();
export default app;
