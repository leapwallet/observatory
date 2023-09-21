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
// async function startPinger(): Promise<void> {
//   if (EnvVars.getNodeEnv() === 'test') return;
//   const pinger = Container.get(Pinger.token);
//   const chainNodeList = EnvVars.readUrls();
//   while (true) {
//     for (const chainNodeMap of chainNodeList) {
//       for (const nodeUrl of chainNodeMap.nodeList) {
//         pinger.ping(nodeUrl, chainNodeMap.chainName);//not sure of type of node
//       }
//     }
//     await sleep({ ms: 60_000 });
//   }
// }

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
    // for (let j=0;j<jsonData.length;j++){
    for (const [j, nodeData] of jsonData.entries()) {
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
        if (arr.length === BATCH_SIZE || (i === nodes.length - 1 && j === jsonData.length - 1)) {
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
      const chainId = chain?.chainId as string;
      // const url = `https://rest-${chain.toLowerCase()}.ecostake.com/`
      const url = `https://rest.cosmos.directory/${chainName.toLowerCase()}`;
      // console.log(url)
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
// const RPC_CDN_URL = `${NMS_URL}nms-RPC.json`;
const REST_STAGING_CDN_URL = `${NMS_URL}staging-nms-REST.json`;
// const RPC_STAGING_CDN_URL = `${NMS_URL}nms-staging-RPC.json`;

async function custom1Filter(nodes: any): Promise<string> {
  for (const node of nodes) {
    if (
      node.nodeUrl.startsWith('https://leap-node-proxy.numia.xyz') ||
      node.nodeUrl.startsWith('https://rpc.cosmos.directory/')
    ) {
      continue;
    }

    return node.nodeUrl;
  }

  return '';
}

async function nmsGetNodeURL(nodes: any, nmsRunType: Types): Promise<string> {
  const logger = getLogger(__filename);
  const url = nodes[0] ? nodes[0]['nodeUrl'] : '';
  switch (nmsRunType) {
    case Types.NMS:
      return url;
    case Types.NMS_CUSTOM1:
      return custom1Filter(nodes);
    case Types.NMS_STAGING:
      return url;
    case Types.NMS_STAGING_CUSTOM1:
      return custom1Filter(nodes);
    default:
      logger.error('Invalid nmsRunType, exiting');
      return '';
  }
}

async function startNMSPinger(nmsRunType: Types): Promise<void> {
  const logger = getLogger(__filename);
  let CDNfileName = '';
  switch (nmsRunType) {
    case Types.NMS:
      CDNfileName = REST_CDN_URL;
      break;
    case Types.NMS_CUSTOM1:
      CDNfileName = REST_CDN_URL;
      break;
    case Types.NMS_STAGING:
      CDNfileName = REST_STAGING_CDN_URL;
      break;
    case Types.NMS_STAGING_CUSTOM1:
      CDNfileName = REST_STAGING_CDN_URL;
      break;
    default:
      logger.error('Invalid nmsRunType, exiting');
      return;
  }
  if (EnvVars.getNodeEnv() === 'test') return;
  const fetch = Container.get(fetchToken);
  // const ecostakeChains = chainNodeList.filter((chain) => chain.isEcostakeChain);

  // let arr = [];
  let promisesArr = [];
  const prisma = Container.get(prismaToken);
  while (true) {
    const pinger = Container.get(Pinger.token);
    const response = await fetch(CDNfileName);
    const jsonData = await response.json();
    const chainIds = Object.keys(jsonData);
    for (let i = 0; i < chainIds.length; i++) {
      const chainId = chainIds[i] || '';
      const nodes = jsonData[chainId!];
      // const url = nodes[0] ? nodes[0]['nodeUrl'] : '';
      const url = await nmsGetNodeURL(nodes, nmsRunType);
      // const resp = await pinger.ping(url, null, nmsRunType, chainId);
      // arr.push(resp);
      promisesArr.push(pinger.ping(url, null, nmsRunType, chainId));
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
startNMSPinger(Types.NMS);
startNMSPinger(Types.NMS_CUSTOM1);
startNMSPinger(Types.NMS_STAGING);
startNMSPinger(Types.NMS_STAGING_CUSTOM1);
startIndividualNodePinger();
prometheus.collectDefaultMetrics();
export default app;
