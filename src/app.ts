import express, { Express } from 'express';
import { Container } from 'typedi';
import { EnvVars, ProcessEnvVars } from './env-vars';
import morgan from 'morgan';
import { getLogger } from './logger';
import cors from 'cors';
import healthRouter from './routes/health';
import metricsRouter from './routes/metrics';
import './cron/db-cleanup';
import { Pinger } from './pinger';
import sleep from './sleep';
import prometheus from 'prom-client';
import { CosmosBlockchain } from './types';
import prismaToken from './db/prisma-token';
import fetchToken from './fetch-token';
import { Prisma, Types } from '@prisma/client';

function setUpHttpLogging(app: Express): void {
  const logger = getLogger('Express.js');
  const handler = morgan('combined', {
    stream: { write: (message) => logger.notice(message) },
  });
  app.use(handler);
}

let BATCH_SIZE = 20;
const t = 60_000;

// @ts-ignore
async function startIndividualNodePinger(): Promise<void> {
  if (EnvVars.getNodeEnv() === 'test') return;
  const logger = getLogger(__filename);
  let arr = [];
  const prisma = Container.get(prismaToken);
  const FILE_NAME = '/individualChainNodeList.json';
  const jsonData = EnvVars.readUrls2(FILE_NAME);
  while (true) {
    const pinger = Container.get(Pinger.token);
    for (const [j, nodeData] of jsonData.entries()) {
      const chainId = nodeData.chainId;
      const nodes = nodeData.nodeList;
      for (let i = 0; i < nodes.length; i++) {
        const url = nodes[i] || '';
        const resp = pinger.ping(url, null, Types.SINGULAR, chainId);
        arr.push(resp);
        if (arr.length === BATCH_SIZE || (i === nodes.length - 1 && j === jsonData.length - 1)) {
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
// @ts-ignore
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
      const chainId = chain?.chainId as string;
      const url = `https://rest.cosmos.directory/${chainName.toLowerCase()}`;
      const resp = pinger.ping(url, chainName, Types.ECOSTAKE, chainId);
      arr.push(resp);
      if (arr.length == BATCH_SIZE || i === ecostakeChains.length - 1) {
        const result = await Promise.all(arr);
        const createCommandResponse = await prisma.responseCode.createMany({ data: result, skipDuplicates: true });
        logger.informational(createCommandResponse);
        arr = [];
      }
    }
    await sleep({ ms: t });
    logger.informational(`Waiting for ${t} ms`);
  }
}

const NMS_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/node-management-service/';
const REST_CDN_URL = `${NMS_URL}nms-REST.json`;
const REST_DASHBOARD = `${NMS_URL}tenants/nms-REST-dashboard.json`;

async function nmsGetNodeURL(nodes: any, nmsRunType: Types): Promise<{ url: string; priority: number }[]> {
  const logger = getLogger(__filename);

  // Check if nodes is null or has no elements
  if (!nodes || nodes.length === 0) {
    logger.error('Nodes are null or empty, exiting');
    return [];
  }

  // Map nodes to URLs with priority, ensuring to handle fewer than 3 nodes gracefully
  let urls = nodes
    .map((node: { [x: string]: any; }, index: any) => ({
      url: node['nodeUrl'] ?? '',
      priority: index+1,
    }))
    .slice(0, 3); // Ensures we take at most the first three

  switch (nmsRunType) {
    case Types.NMS:
    case Types.NMS_DASHBOARD:
      return urls;
    default:
      logger.error('Invalid nmsRunType, exiting');
      return [];
  }
}


async function startNMSPinger(nmsRunType: Types): Promise<void> {
  const logger = getLogger(__filename);
  let CDNfileName = '';
  switch (nmsRunType) {
    case Types.NMS:
      CDNfileName = REST_CDN_URL;
      break;
    case Types.NMS_DASHBOARD:
      CDNfileName = REST_DASHBOARD;
      break;
    default:
      logger.error('Invalid nmsRunType, exiting');
      return;
  }
  if (EnvVars.getNodeEnv() === 'test') return;
  const fetch = Container.get(fetchToken);
  let promisesArr: Promise<Prisma.ResponseCodeCreateInput>[] = [];
  const prisma = Container.get(prismaToken);
  while (true) {
    const pinger = Container.get(Pinger.token);
    const response = await fetch(CDNfileName);
    const jsonData = await response.json();
    const chainIds = Object.keys(jsonData);
    for (let i = 0; i < chainIds.length; i++) {
      const chainId = chainIds[i] || '';
      const nodes = jsonData[chainId!];
      const urls = await nmsGetNodeURL(nodes, nmsRunType);
      urls.forEach(({ url, priority }) => {
        promisesArr.push(
          pinger.ping(url, null, nmsRunType, chainId, '/cosmos/base/tendermint/v1beta1/blocks/latest', priority),
        ); 
      });

      if (promisesArr.length == BATCH_SIZE || i === chainIds.length - 1) {
        const promiseResult = await Promise.all(promisesArr);

        const createCommandResponse = await prisma.responseCode.createMany({
          data: promiseResult,
          skipDuplicates: true,
        });
        logger.informational(createCommandResponse);
        promisesArr = [];
      }
    }
    await sleep({ ms: t });
    logger.informational(`Waiting for ${t} ms`);
  }
}

Container.set(ProcessEnvVars.token, new ProcessEnvVars.DefaultApi());
const app = express();
setUpHttpLogging(app);
app.use(cors());
app.use('/health', healthRouter);
app.use('/metrics', metricsRouter);

startEcostakePinger();
startNMSPinger(Types.NMS);
startNMSPinger(Types.NMS_DASHBOARD);
startIndividualNodePinger();
prometheus.collectDefaultMetrics();
export default app;
