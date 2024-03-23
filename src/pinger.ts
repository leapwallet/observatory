import { Types, Prisma } from '@prisma/client';
import axios from 'axios';
import { Token } from 'typedi';

export namespace Pinger {
  export class DefaultApi {
    async ping(
      url: string,
      chainName: string | null | undefined = null,
      newType: Types = 'ECOSTAKE',
      chainId: string,
      endpoint = '/cosmos/base/tendermint/v1beta1/blocks/latest',
      priority = -1,
      provider: string | null = null,
    ): Promise<Prisma.ResponseCodeCreateInput> {
      const highPriorityChains = [
        'injective',
        'cosmos_hub',
        'osmosis',
        'celestia',
        'sei',
        'nibiru',
        'dymension',
        'kujira',
        'coreum',
        'axelar',
        'neutron',
        'stargaze',
        'stride',
      ];

      // Determine the priority based on the chainId
      const chainPriority = highPriorityChains.includes(chainId) ? 0 : 1;

      const chainUrl = url;

      let responseCode: number;
      let errorMessage: string | null = null;
      const startTime = Date.now();
      try {
        const response = await axios.get(`${url}${endpoint}`, {
          timeout: 20000,
        });
        responseCode = response.status;
      } catch (err: any) {
        if (err.response) {
          responseCode = err.response.status;
        } else if (err.code === 'ECONNABORTED') {
          responseCode = 0;
          errorMessage = 'Connection aborted due to timeout.';
        } else {
          responseCode = 0;
          errorMessage = err.message ? err.message : err.toString();
        }
      }
      const endTime = Date.now();
      const data: Prisma.ResponseCodeCreateInput = {
        type: newType,
        chainName: chainName,
        httpResponseCode: responseCode,
        url: chainUrl,
        responseTime: endTime - startTime,
        chainId: chainId,
        priority: priority,
        provider: provider,
        errorMessage: errorMessage,
        chainPriority: chainPriority,
      };
      return data;
    }
  }
  export const token = new Token<DefaultApi>('Pinger');
}
