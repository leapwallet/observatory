import { Container, Token } from 'typedi';
import { Response } from 'node-fetch';
import fetchToken from './fetch-token';
// import { httpRequestDurationSecondsHistogram, httpRequestsFailedTotal, httpRequestsSucceededTotal } from './metrics';
import { Types, Prisma } from '@prisma/client';
// import prismaToken from './db/prisma-token';

export namespace Pinger {
  // interface responseObject  {chainName:string, responseCode: number, responseType:Types, chainUrl:string, duration:number}
  /** Must be retrieved from the {@link Container}, and not instantiated directly. */
  export class DefaultApi {
    // private type: Types = 'ECOSTAKE';
    /** @param url - The REST API base URL of a Cosmos blockchain node. */
    async ping(
      url: string,
      chainName: string | null | undefined = null,
      newType: Types = 'ECOSTAKE',
      chainId: string,
      endpoint = '/cosmos/base/tendermint/v1beta1/blocks/latest',
      priority = 0, // Add priority here with a default value
    ): Promise<Prisma.ResponseCodeCreateInput> {
      // Return prisma write query back from the loop
      // this.type = newType;
      //const logger = getLogger(__filename);

      const chainUrl = url;
      //logger.informational(`Pinging ${chainName}: ${chainId}: ${isEcostakeUrl}: ${url}.`);
      const fetch = Container.get(fetchToken);
      let response: Response;
      const startTime = Date.now();
      try {
        response = await fetch(`${url}${endpoint}`);
        //logger.debug(`Successful ping:${chainName}: ${chainId}: ${isEcostakeUrl}: ${url}`);
      } catch (err) {
        const endTime = Date.now();
        const responseCode = 0;
        const data: Prisma.ResponseCodeCreateInput = {
          type: newType,
          chainName: chainName,
          httpResponseCode: responseCode,
          url: chainUrl,
          responseTime: endTime - startTime,
          chainId: chainId,
          priority: priority,
        };
        //logger.error(`Failed to ping:${chainName}: ${chainId}: ${isEcostakeUrl}: ${url}: ${err}`);
        return data;
      }
      const endTime = Date.now();
      const data: Prisma.ResponseCodeCreateInput = {
        type: newType,
        chainName: chainName,
        httpResponseCode: response.status,
        url: chainUrl,
        responseTime: endTime - startTime,
        chainId: chainId,
        priority: priority,
      };
      /*if (response.status === 200) {
        logger.debug(
          `OK HTTP status code (${response.status}) returned on ${chainName}: ${chainId}: ${isEcostakeUrl}: ${url}.`,
        );
      } else {
        logger.error(
          `Non-OK HTTP status code (${response.status}) returned on ${chainName}: ${chainId}: ${isEcostakeUrl}: ${url}.`,
        );
      }*/
      return data;
    }
  }
  export const token = new Token<DefaultApi>('Pinger');
}
