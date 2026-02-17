import pg from "pg";

// single pool cause why not lol
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
// TODO: tune pool (max, idleTimeout) when we scale

export async function runQuery<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  return pgPool.query<T>(text, params);
}
