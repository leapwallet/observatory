/** The DB operation failed. For example, the DB was down, or the query was syntactically incorrect. */
export class DbError extends Error {
  constructor(readonly error?: any) {
    super();
  }
}
