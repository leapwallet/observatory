import { EnvVars } from '../env-vars';
import { CosmosBlockchain, chainNodeList } from '../types';
import { HealthyNodes } from './healthyNodes';
import { Container, Token } from 'typedi';

export namespace BlockchainNodeUrlGetter {
  export class DefaultApi {
    private urlIndices: Record<CosmosBlockchain, number> | Record<any, any> = {};

    setUrlIndices(chainNodeList: chainNodeList[]) {
      chainNodeList.forEach((chain) => {
        this.urlIndices[chain.chainName as CosmosBlockchain] = 0;
      });
    }

    getCosmosUrl(blockchain: CosmosBlockchain): string {
      // let urlList = this.getUrls(blockchain);
      const healthyNodesFetcher = Container.get(HealthyNodes.token);
      const urlList = healthyNodesFetcher.getNodes(blockchain);
      if(this.urlIndices[blockchain] >= urlList.length){ // patch for error condition, when unhealthy nodes are removed from HealthyNodes using report(), it needs to update here as well and update the index accordingly
        this.urlIndices[blockchain] = 0;
      }
      const url = urlList[this.urlIndices[blockchain]]!;
      // const logger = getLogger(__filename);
      // logger.informational(`${blockchain} url index ${this.urlIndices[blockchain]}.`);
      this.urlIndices[blockchain]++;
      this.urlIndices[blockchain] = this.urlIndices[blockchain] % urlList.length;
      return url;
    }

    public getUrls(blockchain: CosmosBlockchain): string[] {
      const chainNodeList = EnvVars.readUrls();
      const urls = chainNodeList.find((chain) => chain.chainName === blockchain)?.nodeList;
      return urls!;
    }
  }

  export const token = new Token<DefaultApi>('BlockchainNodeUrlGetter');
}
