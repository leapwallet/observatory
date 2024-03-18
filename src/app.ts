import express, { Express } from 'express';
import { Container } from 'typedi';
import { EnvVars, ProcessEnvVars } from './env-vars';
import morgan from 'morgan';
import { getLogger } from './logger';
import cors from 'cors';
import healthRouter from './routes/health';
import metricsRouter from './routes/metrics';
import './cron/db-cleanup';
import './cron/singular-update';
import './cron/ecostake-update';
import { Pinger } from './pinger';
import sleep from './sleep';
import prometheus from 'prom-client';
import prismaToken from './db/prisma-token';
import fetchToken from './fetch-token';
import { Prisma, Types } from '@prisma/client';
import fs from 'fs';
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
  const prisma = Container.get(prismaToken);
  try {
    const meta = await prisma.meta.findUnique({
      where: {
        key: 'singular_chain_data',
      },
    });

    if (!meta) {
      logger.error('singular_chain_data not found or is empty.');
      return;
    }

    const jsonData = JSON.parse(meta.value)['chainNodeList'];
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      logger.error('Parsed singular_chain_data is empty or not an array.');
      return;
    }

    const chainIdToNameMap = new Map(
      jsonData.map((node: { chainId: string; chainName: string }) => [node.chainId, node.chainName]),
    );

    while (true) {
      try {
        logger.informational('Starting a new iteration of Individual Node Pinger.');
        const pinger = Container.get(Pinger.token);

        const handlePing = async (url: string, chainId: string, chainName: string | undefined) => {
          return pinger.ping(url, chainName, Types.SINGULAR, chainId).catch((error) => {
            logger.error(`Error pinging ${url} for chainId ${chainId}: ${error.message}`);
            return null; // Return a value to keep the array's structure consistent
          });
        };

        const promisesArr = [];
        for (const [, nodeData] of jsonData.entries()) {
          const chainId = nodeData.chainId;
          const nodes = nodeData.nodeList;
          const chainName = chainIdToNameMap.get(chainId);
          for (let i = 0; i < nodes.length; i++) {
            const url = nodes[i] || '';
            promisesArr.push(handlePing(url, chainId, chainName));
          }
        }
        const results = await Promise.all(promisesArr);
        const validResults = results.filter((result): result is Prisma.ResponseCodeCreateInput => result !== null);
        if (validResults.length > 0) {
          await prisma.responseCode.createMany({
            data: validResults,
            skipDuplicates: true,
          });
        }
        logger.informational(
          `Completed an iteration of Individual Node Pinger. Waiting for ${t} ms before the next iteration.`,
        );
      } catch (error) {
        logger.error(`An error occurred during Individual Node Pinger execution: ${error}`);
      }
      await sleep({ ms: t });
    }
  } catch (error) {
    logger.error(`Failed to fetch singular_chain_data: ${error}`);
  }
}

export function readSingularPaidUrls(fileName = '/singularPaidNodes.json'): any[] {
  const configFile = fs.readFileSync(__dirname + fileName);
  const chainNodeListJSON = JSON.parse(configFile.toString());
  return chainNodeListJSON.chainNodeList;
}

async function startSingularPaidNodePinger(): Promise<void> {
  const logger = getLogger(__filename);
  const jsonData = readSingularPaidUrls('/singularPaidNodes.json');
  const prisma = Container.get(prismaToken);

  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    logger.error('Parsed singular_chain_data is empty or not an array.');
    return;
  }

  const chainIdToNameMap = new Map(
    jsonData.map((node: { chainId: string; chainName: string }) => [node.chainId, node.chainName]),
  );

  while (true) {
    try {
      logger.informational('Starting a new iteration of Singular Paid Node Pinger.');
      const pinger = Container.get(Pinger.token); // Assuming Pinger is set up in Container

      const handlePing = async (url: string, chainId: string, chainName: string, provider: string | null) => {
        return pinger
          .ping(
            url,
            chainName,
            Types.SINGULAR_PAID,
            chainId,
            '/cosmos/base/tendermint/v1beta1/blocks/latest',
            0,
            provider,
          )
          .catch((error) => {
            logger.error(`Error pinging ${url} for chainId ${chainId}: ${error.message}`);
            return null;
          });
      };

      const promisesArr = [];
      for (const nodeData of jsonData) {
        const chainId = nodeData.chainId;
        for (const detail of nodeData.details) {
          const provider = detail.provider; // This variable is unused but you might need it later
          const nodes = detail.nodeList;

          // Here's the critical check
          if (!Array.isArray(nodes)) {
            logger.error(
              `Node list for provider "${provider}" in chain "${nodeData.chainName}" (${chainId}) is not an array.`,
            );
            continue; // Skip this iteration
          }

          const chainName = chainIdToNameMap.get(chainId);
          for (const url of nodes) {
            promisesArr.push(handlePing(url, chainId, chainName!, provider));
          }
        }
      }

      const results = await Promise.all(promisesArr);
      const validResults = results.filter((result): result is Prisma.ResponseCodeCreateInput => result !== null);
      if (validResults.length > 0) {
        await prisma.responseCode.createMany({
          data: validResults,
          skipDuplicates: true,
        });
      }

      logger.informational(
        `Completed an iteration of Singular Paid Node Pinger. Waiting for ${t} ms before the next iteration.`,
      );
    } catch (error) {
      logger.error(`An error occurred during Singular Paid Node Pinger execution: ${error}`);
    }
    await sleep({ ms: t });
  }
}

BATCH_SIZE = 20;
60_000;

// @ts-ignore
async function startEcostakePinger(): Promise<void> {
  if (EnvVars.getNodeEnv() === 'test') return;

  const prisma = Container.get(prismaToken);

  const meta = await prisma.meta.findUnique({
    where: {
      key: 'ecostake_chain_data',
    },
  });
  const logger = getLogger(__filename);

  if (!meta) {
    logger.error('ecostake_chain_data not found or is empty.');
    return;
  }
  const chainNodeList = JSON.parse(meta.value);

  if (typeof chainNodeList !== 'object' || chainNodeList === null || Object.keys(chainNodeList).length === 0) {
    logger.error('Parsed ecostake_chain_data is empty or not an object.');
    return;
  }

  let arr = [];

  while (true) {
    try {
      logger.informational('Starting a new iteration of Ecostake Pinger.');
      const pinger = Container.get(Pinger.token);

      const handlePing = async (url: string, chainId: string, chainName: string) => {
        return pinger.ping(url, chainName, Types.ECOSTAKE, chainId).catch((error) => {
          logger.error(`Error pinging ${url} for chainId ${chainId}: ${error.message}`);
          return null;
        });
      };

      for (const [chainKey, chainDetails] of Object.entries(chainNodeList)) {
        const details = chainDetails as any;
        const url = `https://rest.cosmos.directory/${details.chainRegistryPath}`;
        arr.push(handlePing(url, details.chainName, details.chainId));

        if (arr.length === BATCH_SIZE || chainKey === Object.keys(chainNodeList).pop()) {
          const results = await Promise.all(arr);
          const validResults = results.filter((result): result is Prisma.ResponseCodeCreateInput => result !== null);
          if (validResults.length > 0) {
            await prisma.responseCode.createMany({
              data: validResults,
              skipDuplicates: true,
            });
          }
          arr = [];
        }
      }
      logger.informational(`Completed an iteration of Ecostake Pinger. Waiting for ${t} ms before the next iteration.`);
    } catch (error) {
      logger.error(`An error occurred during Ecostake Pinger execution: ${error}`);
    }
    await sleep({ ms: t });
  }
}

const NMS_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/node-management-service/';
const REST_CDN_URL = `${NMS_URL}nms-REST.json`;
const REST_DASHBOARD = `${NMS_URL}tenants/nms-REST-dashboard.json`;

async function nmsGetNodeURL(nodes: any, nmsRunType: Types): Promise<{ url: string; priority: number }[]> {
  const logger = getLogger(__filename);

  // Check if nodes is null or has no elements
  if (!nodes || nodes.length === 0) {
    return [];
  }

  // Map nodes to URLs with priority, ensuring to handle fewer than 3 nodes gracefully
  const urls = nodes
    .map((node: { [x: string]: any }, index: any) => ({
      url: node['nodeUrl'] ?? '',
      priority: index + 1,
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

async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<any> {
  let lastError;
  const logger = getLogger(__filename);
  const fetch = Container.get(fetchToken);

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        // Check if response status code is not successful
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response; // Return response if successful
    } catch (error) {
      lastError = error;
      logger.error(`Fetch attempt ${attempt + 1} failed: ${error}. Retrying in ${delay}ms...`);
      await sleep({ ms: delay }); // Wait for 1 second before retrying
    }
  }
  throw lastError; // Throw the last error after all retries have failed
}

// @ts-ignore
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

  const prisma = Container.get(prismaToken);

  const meta = await prisma.meta.findUnique({
    where: {
      key: 'singular_chain_data',
    },
  });

  if (!meta) {
    logger.error('singular_chain_data not found or is empty.');
    return;
  }

  const jsonData = JSON.parse(meta.value)['chainNodeList'];
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    logger.error('Parsed singular_chain_data is empty or not an array.');
    return;
  }

  const chainIdToNameMap = new Map(
    jsonData.map((node: { chainId: string; chainName: string }) => [node.chainId, node.chainName]),
  );

  if (EnvVars.getNodeEnv() === 'test') return;
  let promisesArr: Promise<Prisma.ResponseCodeCreateInput>[] = [];
  while (true) {
    try {
      logger.informational('Starting a new iteration of NMS Pinger . ' + nmsRunType);
      const pinger = Container.get(Pinger.token);
      const response = await fetchWithRetry(CDNfileName);
      const jsonData = await response.json();
      const chainIds = Object.keys(jsonData);
      for (let i = 0; i < chainIds.length; i++) {
        const chainId = chainIds[i] || '';
        const nodes = jsonData[chainId!];
        const chainName = chainIdToNameMap.get(chainId);
        const urls = await nmsGetNodeURL(nodes, nmsRunType);
        urls.forEach(({ url, priority }) => {
          promisesArr.push(
            pinger.ping(url, chainName, nmsRunType, chainId, '/cosmos/base/tendermint/v1beta1/blocks/latest', priority),
          );
        });

        if (promisesArr.length == BATCH_SIZE || i === chainIds.length - 1) {
          const promiseResult = await Promise.all(promisesArr);

          await prisma.responseCode.createMany({
            data: promiseResult,
            skipDuplicates: true,
          });
          promisesArr = [];
        }
      }
      logger.informational(
        `Completed an iteration of iteration of NMS Pinger ${nmsRunType}. Waiting for ${t} ms before the next iteration.`,
      );
    } catch (error) {
      logger.error(`An error occurred during NMS Pinger execution: ${error}`);
    }
    await sleep({ ms: t });
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
startSingularPaidNodePinger();
prometheus.collectDefaultMetrics();
export default app;
