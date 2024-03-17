import { Container } from 'typedi';
import { ProcessEnvVars } from './env-vars';
import fetchToken from './fetch-token';
import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import { Pinger } from './pinger';
import prismaToken from './db/prisma-token';
import { PrismaClient } from '@prisma/client';

function defaultFetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
  const defaultTimeout = 3_000;
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
}
