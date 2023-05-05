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
import { CosmosBlockchain } from './types';

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
  const ecostakeChains = [
    CosmosBlockchain.CosmosHub,
    CosmosBlockchain.Osmosis,
    CosmosBlockchain.Mars,
    CosmosBlockchain.Juno,
    CosmosBlockchain.Akash,
    CosmosBlockchain.Axelar,
    CosmosBlockchain.EMoney,
    CosmosBlockchain.Persistence,
    CosmosBlockchain.Stargaze,
    CosmosBlockchain.Sifchain,
    CosmosBlockchain.Sommelier,
    CosmosBlockchain.Umee,
    CosmosBlockchain.AssetMantle,
    CosmosBlockchain.Kujira,
    CosmosBlockchain.Injective,
    CosmosBlockchain.Stride,
    CosmosBlockchain.Cheqd,
    CosmosBlockchain.LikeCoin,
    CosmosBlockchain.Chihuahua,
    CosmosBlockchain.GravityBridge,
    CosmosBlockchain.IrisNet,
    CosmosBlockchain.Starname,
    CosmosBlockchain.Desmos,
    CosmosBlockchain.Teritori,
    CosmosBlockchain.Agoric,
    CosmosBlockchain.Terra2,
    CosmosBlockchain.Evmos,
    CosmosBlockchain.Canto,
    CosmosBlockchain.Kava,
    CosmosBlockchain.Crescent,
    CosmosBlockchain.Cudos,
    CosmosBlockchain.Carbon,
    CosmosBlockchain.Decentr,
    CosmosBlockchain.BitCanna,
    CosmosBlockchain.BitSong,
    CosmosBlockchain.Coreum,
    CosmosBlockchain.Kyve,
    CosmosBlockchain.Migaloo,
    CosmosBlockchain.Onomy,
    CosmosBlockchain.Quasar,
    CosmosBlockchain.Quicksilver,
  ];
  const logger = getLogger(__filename);
  while (true) {
    for (const chain of ecostakeChains) {
      // const url = `https://rest-${chain.toLowerCase()}.ecostake.com/`
      const url = `https://rest.cosmos.directory/${chain.toLowerCase()}`;
      // console.log(url)
      pinger.ping(url, chain);
    }
    const t = 3_00_000;
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
prometheus.collectDefaultMetrics();
export default app;
