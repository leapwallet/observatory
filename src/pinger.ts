import { Container, Token } from 'typedi';
import { getLogger } from './logger';
import { Response } from 'node-fetch';
import fetchToken from './fetch-token';
// import { httpRequestDurationSecondsHistogram, httpRequestsFailedTotal, httpRequestsSucceededTotal } from './metrics';
import { Types, Prisma } from '@prisma/client';
// import prismaToken from './db/prisma-token';

export namespace Pinger {
  // interface responseObject  {chainName:string, responseCode: number, responseType:Types, chainUrl:string, duration:number}
  /** Must be retrieved from the {@link Container}, and not instantiated directly. */
  export class DefaultApi {
    private type: Types = 'ECOSTAKE';
    /** @param url - The REST API base URL of a Cosmos blockchain node. */
    async ping(
      url: string,
      chainName: string | null,
      newType: Types = 'ECOSTAKE',
      chainId: string | null = null,
    ): Promise<Prisma.ResponseCodeCreateInput> {
      // Return prisma write query back from the loop
      this.type = newType;
      const logger = getLogger(__filename);
      let isEcostakeUrl = 0;
      logger.informational(url);
      if (url && url.endsWith('.ecostake.com/')) {
        isEcostakeUrl = 1;
      }
      const chainUrl = url;
      logger.informational(`Pinging ${chainName}: ${chainId}: ${isEcostakeUrl}: ${url}.`);
      const fetch = Container.get(fetchToken);
      let response: Response;
      const startTime = Date.now();
      // const end = httpRequestDurationSecondsHistogram.startTimer({
      //   url: chainUrl,
      //   chainName: chainName,
      //   isEcostakeUrl: isEcostakeUrl,
      // });
      try {
        response = await fetch(`${url}/cosmos/base/tendermint/v1beta1/blocks/latest`);
        logger.debug(`Successful ping:${chainName}: ${chainId}: ${isEcostakeUrl}: ${url}`);
      } catch (err) {
        // end();
        const endTime = Date.now();
        const responseCode = 0;
        // let resp = {chainName:chainName, responseCode:0, responseType:this.type, chainUrl:chainUrl, duration:endTime-startTime}
        const data: Prisma.ResponseCodeCreateInput = {
          type: this.type,
          chainName: chainName,
          httpResponseCode: responseCode,
          url: chainUrl,
          responseTime: endTime - startTime,
          chainId: chainId,
        };
        // await this.logResponseCode(chainName, 0, this.type, chainUrl, endTime - startTime);
        // httpRequestsFailedTotal.inc({ url: chainUrl, chainName: chainName, isEcostakeUrl: isEcostakeUrl });
        logger.error(`Failed to ping:${chainName}: ${chainId}: ${isEcostakeUrl}: ${url}: ${err}`);
        return data;
      }
      // end();
      const endTime = Date.now();
      // let resp = {chainName:chainName, responseCode: response.status, responseType:this.type, chainUrl:chainUrl, duration:endTime-startTime}
      const data: Prisma.ResponseCodeCreateInput = {
        type: this.type,
        chainName: chainName,
        httpResponseCode: response.status,
        url: chainUrl,
        responseTime: endTime - startTime,
        chainId: chainId,
      };
      // await this.logResponseCode(chainName, response.status, this.type, chainUrl, endTime - startTime);
      if (response.status === 200) {
        // httpRequestsSucceededTotal.inc({ url: chainUrl, chainName: chainName, isEcostakeUrl: isEcostakeUrl });
        logger.debug(
          `OK HTTP status code (${response.status}) returned on ${chainName}: ${chainId}: ${isEcostakeUrl}: ${url}.`,
        );
      } else {
        // httpRequestsFailedTotal.inc({ url: chainUrl, chainName: chainName, isEcostakeUrl: isEcostakeUrl });
        logger.error(
          `Non-OK HTTP status code (${response.status}) returned on ${chainName}: ${chainId}: ${isEcostakeUrl}: ${url}.`,
        );
      }
      return data;
      // logger.informational(`Done Pinging ${chainName}: ${chainId}: ${isEcostakeUrl}: ${url}.`);
    }

    // private async _logResponseCode(
    //   chainName: string,
    //   httpResponseCode: number,
    //   type: Types,
    //   chainUrl: string,
    //   responseTime: number,
    // ) {
    //   const prisma = Container.get(prismaToken);
    //   const logger = getLogger(__filename);
    //   try {
    //     const data: Prisma.ResponseCodeCreateInput = {
    //       type: type,
    //       chainName: chainName,
    //       httpResponseCode: httpResponseCode,
    //       url: chainUrl,
    //       responseTime: responseTime,
    //     };
    //     await prisma.responseCode.create({ data });
    //   } catch (err) {
    //     // @ts-ignore: TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Exception'.
    //     // span.recordException(err);
    //     // span.setStatus({ code: SpanStatusCode.ERROR, message: 'Failed to create DB entry.' });
    //     // throw new DbError(err);
    //     logger.error(`Failed to log response code in db:${err}`);
    //   }
    // }
  }

  export const token = new Token<DefaultApi>('Pinger');
}
