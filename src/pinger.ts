import { Container, Token } from 'typedi';
import { getLogger } from './logger';
import { Response } from 'node-fetch';
import fetchToken from './fetch-token';
import { httpRequestDurationSecondsHistogram, httpRequestsFailedTotal, httpRequestsSucceededTotal } from './metrics';

export namespace Pinger {
  /** Must be retrieved from the {@link Container}, and not instantiated directly. */
  export class DefaultApi {
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
        response = await fetch(`${url}/blocks/latest`);
        logger.debug(`Successful ping:${chainName}: ${isEcostakeUrl}: ${url}`);
      } catch (err) {
        end();
        httpRequestsFailedTotal.inc({ url: chainUrl, chainName: chainName, isEcostakeUrl: isEcostakeUrl });
        logger.error(`Failed to ping:${chainName}: ${isEcostakeUrl}: ${url}: ${err}`);
        return;
      }
      end();
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
  }

  export const token = new Token<DefaultApi>('Pinger');
}
