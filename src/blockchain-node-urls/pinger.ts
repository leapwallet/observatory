import { Container, Token } from 'typedi';
import { getLogger } from '../logger';
import { Response } from 'node-fetch';
import fetchToken from '../fetch-token';
import { httpRequestDurationSecondsHistogram, httpRequestsFailedTotal, httpRequestsSucceededTotal } from '../metrics';
import { Types, Prisma } from '@prisma/client';
import prismaToken from '../db/prisma-token';
import { BlockchainNodeUrlGetter } from './getter';
import { CosmosBlockchain } from '../types';

export namespace CosmosPinger {
  /** Must be retrieved from the {@link Container}, and not instantiated directly. */
  export class DefaultApi {
    private readonly type: Types = 'INGESTER';
    async ping(chainName: CosmosBlockchain): Promise<void> {
      const logger = getLogger(__filename);
      const blockchainNodeUrlGetter = Container.get(BlockchainNodeUrlGetter.token);
      const url = blockchainNodeUrlGetter.getCosmosUrl(
        chainName,
        BlockchainNodeUrlGetter.CosmosApiEndpoint.LatestBlock,
      );
      logger.informational(`Pinging ${chainName}: ${url}.`);
      console.log(`Pinging ${chainName}: ${url}.`);
      const fetch = Container.get(fetchToken);
      let response: Response;
      const end = httpRequestDurationSecondsHistogram.startTimer({
        url: url,
        chainName: chainName,
      });
      try {
        response = await fetch(`${url}/cosmos/base/tendermint/v1beta1/blocks/latest`);
        logger.debug(`Successful ping:${chainName}: ${url}`);
      } catch (err) {
        end();
        await this.logResponseCode(chainName, 0, this.type, url);
        httpRequestsFailedTotal.inc({ url: url, chainName: chainName });
        logger.error(`Failed to ping:${chainName} ${url}: ${err}`);
        return;
      }
      end();
      await this.logResponseCode(chainName, response.status, this.type, url);
      if (response.status === 200) {
        httpRequestsSucceededTotal.inc({ url: url, chainName: chainName });
        logger.debug(`OK HTTP status code (${response.status}) returned on ${chainName} ${url}.`);
      } else {
        httpRequestsFailedTotal.inc({ url: url, chainName: chainName });
        logger.error(`Non-OK HTTP status code (${response.status}) returned on ${chainName} ${url}.`);
      }
    }

    private async logResponseCode(chainName: string, httpResponseCode: number, type: Types, chainUrl: string) {
      const prisma = Container.get(prismaToken);
      const logger = getLogger(__filename);
      try {
        const data: Prisma.ResponseCodeCreateInput = {
          type: type,
          chainName: chainName,
          httpResponseCode: httpResponseCode,
          url: chainUrl,
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
