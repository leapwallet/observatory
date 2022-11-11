import { Container } from 'typedi';
import { ProcessEnvVars } from '../src/env-vars';
import fetchToken from '../src/fetch-token';
import { Pinger } from '../src/pinger';

afterEach(() => Container.reset());

describe('Pinger', () => {
  describe('DefaultApi', () => {
    describe('ping', () => {
      const setUpBadNetworkTest = () => {
        class MockProcessEnvVars {
          getData() {
            return {};
          }
        }

        const mockFetch = () => {
          throw new Error();
        };

        Container.set(Pinger.token, new Pinger.DefaultApi());
        Container.set(ProcessEnvVars.token, new MockProcessEnvVars());
        Container.set(fetchToken, mockFetch);
      };

      it('must handle failed network requests', async () => {
        setUpBadNetworkTest();
        const pinger = Container.get(Pinger.token);
        await pinger.ping('');
      });

      const setUpStatusTest = () => {
        class MockProcessEnvVars {
          getData() {
            return {};
          }
        }

        const mockFetch = () => {
          return { status: 500 };
        };

        Container.set(Pinger.token, new Pinger.DefaultApi());
        Container.set(ProcessEnvVars.token, new MockProcessEnvVars());
        Container.set(fetchToken, mockFetch);
      };

      it('must handle non-200 HTTP status codes', async () => {
        setUpStatusTest();
        const pinger = Container.get(Pinger.token);
        await pinger.ping('');
      });
    });
  });
});
