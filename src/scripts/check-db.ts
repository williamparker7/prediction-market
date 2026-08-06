import type { RowDataPacket } from "mysql2/promise";
import { pool, ping, close } from "../db/index.js";

interface ServerInfo extends RowDataPacket {
  version: string;
  db: string | null;
}

async function main(): Promise<void> {
  await ping();

  const [rows] = await pool.query<ServerInfo[]>(
    "SELECT VERSION() AS version, DATABASE() AS db",
  );

  const info = rows[0];
  console.log(`Connected to MySQL ${info?.version} (database: ${info?.db})`);
}

main()
  .catch((err: unknown) => {
    console.error("Could not reach the database:");
    console.error(err);
    process.exitCode = 1;
  })
  .finally(close);
