import { Container, Token } from 'typedi';

export namespace ProcessEnvVars {
  /** Must be retrieved from the {@link Container}, and not instantiated directly. */
  export class DefaultApi {
    getData(): NodeJS.ProcessEnv {
      return process.env;
    }
  }

  export const token = new Token<DefaultApi>('ProcessEnvVars');
}

/**
 * Convenience functions for accessing {@link ProcessEnvVars}. Functions return the default value (e.g., `'localhost'`)
 * if the value is `undefined` or `''`.
 */
export namespace EnvVars {
  function isUnset(value: string | undefined): value is '' | undefined {
    return value === '' || value === undefined;
  }

  function getEnvVar(key: string): string | undefined {
    const processEnvVars = Container.get(ProcessEnvVars.token);
    return processEnvVars.getData()[key];
  }

  /** @returns `'test'` if the `NODE_ENV` environment variable is `undefined` or `''`. */
  export function getNodeEnv(): string {
    const value = getEnvVar('NODE_ENV');
    return isUnset(value) ? 'test' : value;
  }

  export function getPort(): number {
    const value = getEnvVar('PORT');
    return isUnset(value) ? 3_000 : Number(value);
  }

  export function getUrls(): string[] {
    const value = getEnvVar('URLS');
    return isUnset(value) ? [] : value.split(',');
  }
}
