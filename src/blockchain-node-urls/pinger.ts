import { Container, Token } from 'typedi';
import { getLogger } from '../logger';
import { Response } from 'node-fetch';
import fetchToken from '../fetch-token';
import { Types, Prisma } from '@prisma/client';
import prismaToken from '../db/prisma-token';
import { BlockchainNodeUrlGetter } from './getter';
import { HealthyNodes } from './healthyNodes';
import { CosmosBlockchain } from '../types';

export namespace CosmosPinger {
  /** Must be retrieved from the {@link Container}, and not instantiated directly. */
  export class DefaultApi {
    private readonly type: Types = 'INGESTER';
    async ping(chainName: CosmosBlockchain): Promise<void> {
      const logger = getLogger(__filename);
      const blockchainNodeUrlGetter = Container.get(BlockchainNodeUrlGetter.token);
      const healthyNodesFetcher = Container.get(HealthyNodes.token);
      let tries = 0;
      while (true) {
        const url = blockchainNodeUrlGetter.getCosmosUrl(chainName);
        logger.informational(`Pinging ${chainName}: ${url}.`);
        const fetch = Container.get(fetchToken);
        let response: Response;
        const startTime = Date.now();
        try {
          tries++;
          response = await fetch(`${url}/cosmos/base/tendermint/v1beta1/blocks/latest`);
          logger.debug(`Successful ping:${chainName}: ${url}`);
        } catch (err) {
          logger.error(`Failed to ping:${chainName} ${url}: ${err}`);
          healthyNodesFetcher.report({ chainID: chainName, lcdURL: url, responseCode: 0 });
          if (tries === 3) {
            const endTime = Date.now();
            await this.logResponseCode(chainName, 0, this.type, url, endTime - startTime);
            return;
          }
          continue;
        }

        const endTime = Date.now();
        if (response.status === 200) {
          logger.debug(`OK HTTP status code (${response.status}) returned on ${chainName} ${url}.`);
          await this.logResponseCode(chainName, response.status, this.type, url, endTime - startTime);
          return;
        } else {
          if (!url.startsWith('https://rest.cosmos.directory/')) {
            healthyNodesFetcher.report({ chainID: chainName, lcdURL: url, responseCode: response.status });
          }
          logger.error(`Non-OK HTTP status code (${response.status}) returned on ${chainName} ${url}.`);
          if (tries === 3) {
            await this.logResponseCode(chainName, response.status, this.type, url, endTime - startTime);
            return;
          }
        }
      }
    }

    private async logResponseCode(
      chainName: string,
      httpResponseCode: number,
      type: Types,
      chainUrl: string,
      responseTime: number,
    ) {
      const prisma = Container.get(prismaToken);
      const logger = getLogger(__filename);
      try {
        const data: Prisma.ResponseCodeCreateInput = {
          type: type,
          chainName: chainName,
          httpResponseCode: httpResponseCode,
          url: chainUrl,
          responseTime: responseTime,
        };
        await prisma.responseCode.create({ data });
      } catch (err) {
        // @ts-ignore: TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Exception'.
        // throw new DbError(err);
        logger.error(`Failed to log response code in db:${err}`);
      }
    }
  }

  export const token = new Token<DefaultApi>('CosmosPinger');
}
