import { Container, Token } from 'typedi';
import { getLogger } from './logger';
import { Response } from 'node-fetch';
import fetchToken from './fetch-token';
import { httpRequestDurationSecondsHistogram, httpRequestsFailedTotal, httpRequestsSucceededTotal } from './metrics';
import { Types, Prisma } from '@prisma/client';
import prismaToken from './db/prisma-token';
export namespace Pinger {
  /** Must be retrieved from the {@link Container}, and not instantiated directly. */
  export class DefaultApi {
    private readonly type: Types = 'ECOSTAKE';
    /** @param url - The REST API base URL of a Cosmos blockchain node. */
    async ping(url: string, chainName: string): Promise<void> {
      const logger = getLogger(__filename);
      // const chainUrl = `${chainName}|${url}`;
      let isEcostakeUrl = 0;
      if (url.endsWith('.ecostake.com/')) {
        isEcostakeUrl = 1;
      }
      const chainUrl = url;
      logger.informational(`Pinging ${chainName}: ${isEcostakeUrl}: ${url}.`);
      const fetch = Container.get(fetchToken);
      let response: Response;
      const end = httpRequestDurationSecondsHistogram.startTimer({
        url: chainUrl,
        chainName: chainName,
        isEcostakeUrl: isEcostakeUrl,
      });
      try {
        response = await fetch(`${url}/cosmos/base/tendermint/v1beta1/blocks/latest`);
        logger.debug(`Successful ping:${chainName}: ${isEcostakeUrl}: ${url}`);
      } catch (err) {
        end();
        await this.logResponseCode(chainName, 0, this.type, chainUrl);
        httpRequestsFailedTotal.inc({ url: chainUrl, chainName: chainName, isEcostakeUrl: isEcostakeUrl });
        logger.error(`Failed to ping:${chainName}: ${isEcostakeUrl}: ${url}: ${err}`);
        return;
      }
      end();
      await this.logResponseCode(chainName, response.status, this.type, chainUrl);
      if (response.status === 200) {
        httpRequestsSucceededTotal.inc({ url: chainUrl, chainName: chainName, isEcostakeUrl: isEcostakeUrl });
        logger.debug(`OK HTTP status code (${response.status}) returned on ${chainName}: ${isEcostakeUrl}: ${url}.`);
      } else {
        httpRequestsFailedTotal.inc({ url: chainUrl, chainName: chainName, isEcostakeUrl: isEcostakeUrl });
        logger.error(
          `Non-OK HTTP status code (${response.status}) returned on ${chainName}: ${isEcostakeUrl}: ${url}.`,
        );
      }
      // logger.informational(`Done Pinging ${chainName}: ${isEcostakeUrl}: ${url}.`);
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
        // span.recordException(err);
        // span.setStatus({ code: SpanStatusCode.ERROR, message: 'Failed to create DB entry.' });
        // throw new DbError(err);
        logger.error(`Failed to log response code in db:${err}`);
      }
    }
  }

  export const token = new Token<DefaultApi>('Pinger');
}
