import express, { Express } from 'express';
import { Container } from 'typedi';
import { EnvVars, ProcessEnvVars } from './env-vars';
import morgan from 'morgan';
import { getLogger } from './logger';
import cors from 'cors';
import healthRouter from './routes/health';
import metricsRouter from './routes/metrics';
import { Pinger } from './pinger';
// import { CosmosPinger } from './blockchain-node-urls/pinger';
// import { HealthyNodes } from './blockchain-node-urls/healthyNodes';
// import { BlockchainNodeUrlGetter } from './blockchain-node-urls/getter';
import sleep from './sleep';
import prometheus from 'prom-client';
import { CosmosBlockchain } from './types';
import prismaToken from './db/prisma-token';
import fetchToken from './fetch-token';
import { Types } from '@prisma/client';

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

let BATCH_SIZE = 20;
const t = 60_000;
async function startIndividualNodePinger(): Promise<void> {
  if (EnvVars.getNodeEnv() === 'test') return;
  // const fetch = Container.get(fetchToken);
  // const ecostakeChains = chainNodeList.filter((chain) => chain.isEcostakeChain);
  const logger = getLogger(__filename);
  let arr = [];
  const prisma = Container.get(prismaToken);
  const FILE_NAME = '/individualChainNodeList.json';
  const jsonData = EnvVars.readUrls2(FILE_NAME);
  while (true) {
    const pinger = Container.get(Pinger.token);
    // const response = await fetch(s3File);
    // const jsonData = await response.json();
    // const promises = []
    for (const nodeData of jsonData) {
      // for (let i = 0; i < chainIds.length; i++) {
      const chainId = nodeData.chainId;
      const nodes = nodeData.nodeList;
      for (let i = 0; i < nodes.length; i++) {
        // const chainId = node["chainId"]
        // const nodeList = node["nodeList"]

        // for (const nodeUrl of nodeList){
        // for(let i=0;i<nodeList.length;i++){
        const url = nodes[i] || '';
        const resp = pinger.ping(url, null, Types.SINGULAR, chainId);
        arr.push(resp);
        if (arr.length == BATCH_SIZE || i === nodes.length - 1) {
          // await for promises to complete
          const result = await Promise.all(arr);

          const createCommandResponse = await prisma.responseCode.createMany({ data: result, skipDuplicates: true });
          logger.informational(createCommandResponse);
          arr = [];
        }
      }
    }
    logger.informational(`Waiting for ${t} ms`);
    await sleep({ ms: t });
  }
}

BATCH_SIZE = 20;
60_000;
async function startEcostakePinger(): Promise<void> {
  if (EnvVars.getNodeEnv() === 'test') return;
  const chainNodeList = EnvVars.readUrls();
  const ecostakeChains = chainNodeList.filter((chain) => chain.isEcostakeChain);
  const logger = getLogger(__filename);
  let arr = [];
  const prisma = Container.get(prismaToken);
  while (true) {
    const pinger = Container.get(Pinger.token);
    for (let i = 0; i < ecostakeChains.length; i++) {
      const chain = ecostakeChains[i];
      const chainName = chain?.chainName as CosmosBlockchain;
      // const url = `https://rest-${chain.toLowerCase()}.ecostake.com/`
      const url = `https://rest.cosmos.directory/${chainName.toLowerCase()}`;
      // console.log(url)
      const resp = await pinger.ping(url, chainName);
      arr.push(resp);
      if (arr.length == BATCH_SIZE || i === ecostakeChains.length - 1) {
        const createCommandResponse = await prisma.responseCode.createMany({ data: arr, skipDuplicates: true });
        logger.informational(createCommandResponse);
        arr = [];
      }
    }
    await sleep({ ms: t });
    logger.informational(`Waiting for ${t} ms`);
  }
}
const s3File =
  'https://leap-wallet-assets.s3.us-east-1.amazonaws.com/cosmos-registry/v1/node-management-service/nms-REST.json';
async function startNMSPinger(): Promise<void> {
  if (EnvVars.getNodeEnv() === 'test') return;
  const fetch = Container.get(fetchToken);
  // const ecostakeChains = chainNodeList.filter((chain) => chain.isEcostakeChain);
  const logger = getLogger(__filename);
  let arr = [];
  const prisma = Container.get(prismaToken);
  while (true) {
    const pinger = Container.get(Pinger.token);
    const response = await fetch(s3File);
    const jsonData = await response.json();
    const chainIds = Object.keys(jsonData);
    for (let i = 0; i < chainIds.length; i++) {
      const chainId = chainIds[i] || null;
      const nodes = jsonData[chainId!];
      const url = nodes[0] ? nodes[0]['nodeUrl'] : '';
      const resp = await pinger.ping(url, null, Types.NMS, chainId);
      arr.push(resp);
      if (arr.length == BATCH_SIZE || i === chainIds.length - 1) {
        const createCommandResponse = await prisma.responseCode.createMany({ data: arr, skipDuplicates: true });
        logger.informational(createCommandResponse);
        arr = [];
      }
    }
    await sleep({ ms: t });
    logger.informational(`Waiting for ${t} ms`);
  }
}

// async function startCosmosPinger(): Promise<void> {
//   if (EnvVars.getNodeEnv() === 'test') return;
//   const healthyNodesFetcher = Container.get(HealthyNodes.token);
//   const chainNodeList = EnvVars.readUrls();
//   healthyNodesFetcher.startHealthyNodeFetcher(chainNodeList);

//   const pinger = Container.get(CosmosPinger.token);
//   const blockchainNodeUrlGetter = Container.get(BlockchainNodeUrlGetter.token);
//   blockchainNodeUrlGetter.setUrlIndices(chainNodeList);
//   const logger = getLogger(__filename);
//   while (true) {
//     for (const chainNodeMap of chainNodeList) {
//       pinger.ping(chainNodeMap.chainName as CosmosBlockchain);
//     }
//     const t = 60_000;
//     await sleep({ ms: t });
//     logger.informational(`Waiting for ${t} ms`);
//   }
// }

Container.set(ProcessEnvVars.token, new ProcessEnvVars.DefaultApi());
const app = express();
setUpHttpLogging(app); // Set up HTTP logging ASAP so that requests get loggedd.
app.use(cors());
app.use('/health', healthRouter);
app.use('/metrics', metricsRouter);
// startPinger();
startEcostakePinger();
// startCosmosPinger();
startNMSPinger();
prometheus.collectDefaultMetrics();
export default app;
