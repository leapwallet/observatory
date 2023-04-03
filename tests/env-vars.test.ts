import { Container } from 'typedi';
import { EnvVars, ProcessEnvVars } from '../src/env-vars';

afterEach(() => Container.reset());

describe('EnvVars', () => {
  class ProcessEnvVarsApi {
    constructor(private readonly data: NodeJS.ProcessEnv = {}) {}

    getData(): NodeJS.ProcessEnv {
      return this.data;
    }
  }

  describe('getPort', () => {
    const defaultValue = 3_000;

    it('must return <3_000> when not set', () => {
      Container.set(ProcessEnvVars.token, new ProcessEnvVarsApi());
      expect(EnvVars.getPort()).toBe(defaultValue);
    });

    it("must return <3_000> when set with <''>", () => {
      Container.set(ProcessEnvVars.token, new ProcessEnvVarsApi({ PORT: '' }));
      expect(EnvVars.getPort()).toBe(defaultValue);
    });

    it('must return the set value', () => {
      const value = '9000';
      Container.set(ProcessEnvVars.token, new ProcessEnvVarsApi({ PORT: value }));
      expect(EnvVars.getPort()).toBe(Number(value));
    });
  });

  describe('getNodeEnv', () => {
    const defaultValue = 'test';

    it("must return <'test'> when not set", () => {
      Container.set(ProcessEnvVars.token, new ProcessEnvVarsApi());
      expect(EnvVars.getNodeEnv()).toBe(defaultValue);
    });

    it("must return <'test'> when set with <''>", () => {
      Container.set(ProcessEnvVars.token, new ProcessEnvVarsApi({ NODE_ENV: '' }));
      expect(EnvVars.getNodeEnv()).toBe(defaultValue);
    });

    it('must return the set value', () => {
      const value = 'dev';
      Container.set(ProcessEnvVars.token, new ProcessEnvVarsApi({ NODE_ENV: value }));
      expect(EnvVars.getNodeEnv()).toBe(value);
    });
  });

  describe('getUrls', () => {
    it("must return <'test'> when not set", () => {
      Container.set(ProcessEnvVars.token, new ProcessEnvVarsApi());
      expect(EnvVars.getUrls()).toStrictEqual([]);
    });

    it("must return <'test'> when set with <''>", () => {
      Container.set(ProcessEnvVars.token, new ProcessEnvVarsApi({ URLS: '' }));
      expect(EnvVars.getUrls()).toStrictEqual([]);
    });

    it('must return the set value', () => {
      Container.set(ProcessEnvVars.token, new ProcessEnvVarsApi({ URLS: '1,2,3' }));
      expect(EnvVars.getUrls()).toStrictEqual(['1', '2', '3']);
    });
  });

  // describe('readUrls', () => {
  //   it("urls File must exist in repo", () => {
  //     Container.set(ProcessEnvVars.token, new ProcessEnvVarsApi());
  //     expect(EnvVars.getUrls()).toStrictEqual([]);
  //   });

  // });
});
