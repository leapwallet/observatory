import { Container, Token } from 'typedi';
import { getLogger } from './logger';
import { Response } from 'node-fetch';
import fetchToken from './fetch-token';
import { httpRequestDurationSecondsHistogram, httpRequestsFailedTotal, httpRequestsSucceededTotal } from './metrics';

export namespace Pinger {
  /** Must be retrieved from the {@link Container}, and not instantiated directly. */
  export class DefaultApi {
    /** @param url - The REST API base URL of a Cosmos blockchain node. */
    async ping(url: string): Promise<void> {
      const logger = getLogger(__filename);
      logger.informational(`Pinging ${url}.`);
      const fetch = Container.get(fetchToken);
      let response: Response;
      const end = httpRequestDurationSecondsHistogram.startTimer({ url });
      try {
        response = await fetch(`${url}/blocks/latest`);
      } catch (err) {
        end();
        httpRequestsFailedTotal.inc({ url });
        logger.error(`Failed to ping: ${err}`);
        return;
      }
      end();
      if (response.status === 200) httpRequestsSucceededTotal.inc({ url });
      else {
        httpRequestsFailedTotal.inc({ url });
        logger.error(`Non-OK HTTP status code (${response.status}) returned.`);
      }
    }
  }

  export const token = new Token<DefaultApi>('Pinger');
}
