import { Prisma } from '@prisma/client';
import { Container, Token } from 'typedi';
import prismaToken from '../prisma-token';
import { DbError } from '../error';

export namespace LastProcessedBlocksTable {
  /** Must be retrieved from the {@link Container}, and not instantiated directly. */
  export class DefaultApi {
    /**
     * @returns The last block height successfully processed ƒor the {@link blockchain}. `null` indicates that the
     * {@link blockchain} has never been queried.
     * @throws {@link DbError}
     */
    /**
     * Use this if the {@link blockchain} doesn't have an entry for the {@link blockHeight}.
     * @throws {@link DbError}
     * @see {@link updateBlockHeight}
     */
    async createEntry(data: Prisma.ResponseCodeCreateInput): Promise<void> {
      const prisma = Container.get(prismaToken);
      try {
        await prisma.responseCode.create({ data });
      } catch (err) {
        // @ts-ignore: TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Exception'.
        //   span.recordException(err);
        //   span.setStatus({ code: SpanStatusCode.ERROR, message: 'Failed to create DB entry.' });
        throw new DbError(err);
      }
    }
  }
  export const token = new Token<DefaultApi>('ResponseCodeTable');
}
