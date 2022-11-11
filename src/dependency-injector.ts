import { Container } from 'typedi';
import { ProcessEnvVars } from './env-vars';
import fetchToken from './fetch-token';
import fetch from 'node-fetch';
import { Pinger } from './pinger';

export default function injectDependencies(): void {
  Container.set(ProcessEnvVars.token, new ProcessEnvVars.DefaultApi());
  Container.set(fetchToken, fetch);
  Container.set(Pinger.token, new Pinger.DefaultApi());
}
