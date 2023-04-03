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
      const chainUrl = `${chainName}|${url}`;
      logger.informational(`Pinging ${chainUrl}.`);
      const fetch = Container.get(fetchToken);
      let response: Response;
      const end = httpRequestDurationSecondsHistogram.startTimer({ url: chainUrl });
      try {
        response = await fetch(`${url}/blocks/latest`);
      } catch (err) {
        end();
        httpRequestsFailedTotal.inc({ url: chainUrl });
        logger.error(`Failed to ping:${chainUrl}: ${err}`);
        return;
      }
      end();
      if (response.status === 200) httpRequestsSucceededTotal.inc({ url: chainUrl });
      else {
        httpRequestsFailedTotal.inc({ url: chainUrl });
        logger.error(`Non-OK HTTP status code (${response.status}) returned on ${chainUrl}.`);
      }
      // logger.informational(`Done Pinging ${chainUrl}.`);
    }
  }

  export const token = new Token<DefaultApi>('Pinger');
}
