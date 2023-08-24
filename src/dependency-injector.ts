import { Container } from 'typedi';
import { ProcessEnvVars } from './env-vars';
import fetchToken from './fetch-token';
import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import { Pinger } from './pinger';
import { CosmosPinger } from './blockchain-node-urls/pinger';
import { BlockchainNodeUrlGetter } from './blockchain-node-urls/getter';
import prismaToken from './db/prisma-token';
import { PrismaClient } from '@prisma/client';
import { HealthyNodes } from './blockchain-node-urls/healthyNodes';

function defaultFetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
  const defaultTimeout = 10_000;
  if (!init) {
    init = {
      timeout: defaultTimeout,
    };
  } else if (!init.timeout) {
    init.timeout = defaultTimeout;
  }

  return fetch(url, init);
}

export default function injectDependencies(): void {
  Container.set(ProcessEnvVars.token, new ProcessEnvVars.DefaultApi());
  Container.set(fetchToken, defaultFetch);
  Container.set(prismaToken, new PrismaClient());
  Container.set(Pinger.token, new Pinger.DefaultApi());
  Container.set(CosmosPinger.token, new CosmosPinger.DefaultApi());
  Container.set(HealthyNodes.token, new HealthyNodes.DefaultApi());
  Container.set(BlockchainNodeUrlGetter.token, new BlockchainNodeUrlGetter.DefaultApi());
}
