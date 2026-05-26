import {
  Global,
  Injectable,
  Module,
  type OnModuleDestroy,
} from "@nestjs/common";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../config/env.schema";
import * as schema from "./schema";
export const DATABASE = Symbol("DATABASE");
@Injectable()
export class DbPool implements OnModuleDestroy {
  readonly pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 15,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });
  readonly db = drizzle(this.pool, { schema });

  constructor() {
    this.pool.on("error", (err) => {
      console.warn("Postgres pool error (idle client):", err?.message || err);
    });
  }
  async onModuleDestroy() {
    await this.pool.end();
  }
}
export type Database = NodePgDatabase<typeof schema>;
@Global()
@Module({
  providers: [
    DbPool,
    { provide: DATABASE, useFactory: (db: DbPool) => db.db, inject: [DbPool] },
  ],
  exports: [DbPool, DATABASE],
})
export class DatabaseModule {}
