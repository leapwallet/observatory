import { Response } from 'node-fetch';
import { Container, Token } from 'typedi';
import fetchToken from '../fetch-token';
import { CosmosBlockchain } from '../types';
import { getLogger } from '../logger';
import { BlockchainNodeUrlGetter } from './getter';
import { EnvVars } from '../env-vars';
import sleep from '../sleep';

export interface HealthyNodeReport {
  chainID: CosmosBlockchain;
  lcdURL: string;
  responseCode: number | string;
}

const COSMOS_DIRECTORY_STATUS_URL = 'https://status.cosmos.directory/';

export interface StatusResponse {
  rest: {
    available: boolean;
    best: {
      address: string;
      provider: string;
    };
  };
}

export interface LCDUrl {
  address: string;
  weight: number;
  isParked?: boolean;
  parkedTime?: number;
}

export namespace HealthyNodes {
  export class DefaultApi {
    nodes: any = {};
    getStatusFromCosmosDirectory = async (chain: CosmosBlockchain): Promise<StatusResponse | null> => {
      const url = `${COSMOS_DIRECTORY_STATUS_URL}${chain.toLowerCase()}`;
      const logger = getLogger(__filename);
      logger.informational(`Getting status from ${COSMOS_DIRECTORY_STATUS_URL}.`);
      let response: Response;
      const fetch = Container.get(fetchToken);
      try {
        response = await fetch(url);
      } catch (err) {
        logger.informational(`Failed to ping ${url}: ${err}`);
        return null;
      }
      if (response.status !== 200) {
        logger.informational(`${url} isn't working as expected because of non-OK HTTP status code ${response.status}`);
        return null;
      }
      logger.informational(`Successfully fetched latest nodes from ${url}}`);
      return response.json();
    };

    async getLatestNodes(chainName: CosmosBlockchain): Promise<LCDUrl[]> {
      const response = await this.getStatusFromCosmosDirectory(chainName);
      if (response !== null && response.rest && response.rest.best && Array.isArray(response.rest.best)) {
        return response.rest.best.map((lcdUrl) => {
          return { ...lcdUrl, weight: 1000 };
        });
      }

      const blockchainNodeUrlGetter = Container.get(BlockchainNodeUrlGetter.token);
      const defaultBlockChainUrls = blockchainNodeUrlGetter.getUrls(chainName);

      if (defaultBlockChainUrls && Array.isArray(defaultBlockChainUrls)) {
        // Fallback to default node
        return defaultBlockChainUrls.map((url) => {
          return { address: url, weight: 1000 };
        });
      }
      return [];
    }

    report(options: HealthyNodeReport): void {
      getLogger(__filename).informational(
        `Reporting error for ${options.chainID} for LCDUrl ${options.lcdURL} with code ${options.responseCode}`,
      );
      if (!options.chainID || !options.lcdURL || !options.responseCode) {
        return;
      }

      const nodes = this.getNodes(options.chainID);

      if (nodes[options.lcdURL]) {
        if (options.responseCode === 429) {
          getLogger(__filename).informational(`Reporting 429 for ${options.chainID} for LCDUrl ${options.lcdURL}`);
          this.nodes[options.chainID] = this.nodes[options.chainID].map((lcdUrl: LCDUrl) => {
            if (lcdUrl.address === options.lcdURL) {
              lcdUrl.isParked = true;
              lcdUrl.parkedTime = Date.now(); // useful if need need to apply parking lot timing
            }
          });
        }
      }
    }

    setNodes(chainName: CosmosBlockchain, nodes: LCDUrl[]) {
      this.nodes[chainName] = nodes;
    }

    getDefaultNodes(chainName: CosmosBlockchain) {
      const blockchainNodeUrlGetter = Container.get(BlockchainNodeUrlGetter.token);
      const defaultBlockChainUrls = blockchainNodeUrlGetter.getUrls(chainName);
      return defaultBlockChainUrls;
    }

    getNodes(chainName: CosmosBlockchain) {
      const nodes = this.nodes[chainName] || [];
      if (nodes.length === 0) {
        getLogger(__filename).informational(
          `There is no best nodes for chain ${chainName}, falling back to default nodes`,
        );
        return this.getDefaultNodes(chainName);
      }

      const bestNodes = nodes
        .sort((a: LCDUrl, b: LCDUrl) => a.weight - b.weight)
        .filter((lcdUrl: LCDUrl) => {
          if (!lcdUrl.isParked) {
            return true;
          }
          return false;
        })
        .map((lcdUrl: LCDUrl) => {
          return lcdUrl.address;
        });

      if (bestNodes.length === 0) {
        getLogger(__filename).emergency(`All best nodes moved to Parking lot for chain ${chainName}`);
        return this.getDefaultNodes(chainName);
      }
      getLogger(__filename).informational(`Using latest nodes for chain ${chainName}`);
      return bestNodes;
    }

    async startStatusFetcher(chainName: CosmosBlockchain): Promise<undefined> {
      const nodes = await this.getLatestNodes(chainName);
      this.setNodes(chainName, nodes);
      return;
    }

    private async fetchHealthyNode(blockchain: CosmosBlockchain): Promise<void> {
      while (true) {
        const healthyNodesFetcher = Container.get(HealthyNodes.token);
        healthyNodesFetcher.startStatusFetcher(blockchain);

        if (EnvVars.getNodeEnv() === 'test') return;
        await sleep({ ms: 60 * 60 * 1000 }); // 1 hour
      }
    }

    /**
     * Periodically updates the nodes for the {@link blockchain}
     */
    startHealthyNodeFetcher() {
      [
        CosmosBlockchain.CosmosHub,
        CosmosBlockchain.Osmosis,
        CosmosBlockchain.Mars,
        CosmosBlockchain.Juno,
        CosmosBlockchain.Akash,
        CosmosBlockchain.Axelar,
        CosmosBlockchain.EMoney,
        CosmosBlockchain.Persistence,
        CosmosBlockchain.Stargaze,
        CosmosBlockchain.Sifchain,
        CosmosBlockchain.Sommelier,
        CosmosBlockchain.Umee,
        CosmosBlockchain.AssetMantle,
        CosmosBlockchain.Kujira,
        CosmosBlockchain.Injective,
        CosmosBlockchain.Stride,
        CosmosBlockchain.Cheqd,
        CosmosBlockchain.LikeCoin,
        CosmosBlockchain.Chihuahua,
        CosmosBlockchain.GravityBridge,
        CosmosBlockchain.IrisNet,
        CosmosBlockchain.Starname,
        CosmosBlockchain.Desmos,
        CosmosBlockchain.Teritori,
        CosmosBlockchain.Agoric,
        CosmosBlockchain.Terra2,
        CosmosBlockchain.Evmos,
        CosmosBlockchain.Canto,
        CosmosBlockchain.Kava,
        CosmosBlockchain.Crescent,
        CosmosBlockchain.Cudos,
        CosmosBlockchain.Carbon,
        CosmosBlockchain.Decentr,
        CosmosBlockchain.BitCanna,
        CosmosBlockchain.BitSong,
        CosmosBlockchain.Coreum,
        CosmosBlockchain.Kyve,
        CosmosBlockchain.Migaloo,
        CosmosBlockchain.Onomy,
        CosmosBlockchain.Quasar,
        CosmosBlockchain.Quicksilver,
      ].forEach((blockchain) => this.fetchHealthyNode(blockchain));
    }
  }

  export const token = new Token<DefaultApi>('HeathlyNodes');
}
