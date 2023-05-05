import { Container, Token } from 'typedi';

import prismaToken from './prisma-token';
import { DbError } from './error';
// import { SpanStatusCode } from '@opentelemetry/api';
// import withSpan from '../telemetry/tracer';

export namespace Db {
  /** Must be retrieved from the {@link Container}, and not instantiated directly. */
  export class DefaultApi {
    /**
     * @returns Whether the DB is functioning as expected.
     * @throws {@link DbError}
     */
    async isUp(): Promise<boolean> {
      //   return await withSpan(
      //     { traceName: 'db', spanName: 'health-checker' },
      //     { fn: this.isUp.name, ns: DefaultApi.name, path: __filename },
      // async (span) => {
      const prisma = Container.get(prismaToken);
      type Row = Record<'state', string>;
      let rows: Row[];
      try {
        rows = await prisma.$queryRaw<Row[]>`SELECT state FROM pg_stat_activity;`;
      } catch (err) {
        // @ts-ignore: TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Exception'.
        // span.recordException(err);
        // span.setStatus({ code: SpanStatusCode.ERROR, message: 'Failed to query DB.' });
        throw new DbError(err);
      }
      return rows.some((row) => Object.values(row)[0] === 'active');
    }
    //   );
    // }
  }

  export const token = new Token<DefaultApi>('Db');
}
