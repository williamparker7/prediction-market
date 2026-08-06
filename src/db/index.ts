import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set (expected it in .env)");
}

export const pool = mysql.createPool(DATABASE_URL);

/** Round-trips a trivial query to confirm the database is reachable. */
export async function ping(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.query("SELECT 1");
  } finally {
    conn.release();
  }
}

export async function close(): Promise<void> {
  await pool.end();
}
