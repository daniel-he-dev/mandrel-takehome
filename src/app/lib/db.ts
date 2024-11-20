import { Pool } from "pg";

console.log("Connecting to database...");
const pool = new Pool({
  user: process.env.POSTGRES_USER ?? "postgres",
  password: process.env.POSTGRES_PASSWORD ?? "postgres",
  host: process.env.POSTGRES_HOST ?? "localhost",
  port: Number(process.env.POSTGRES_PORT) ?? 5432,
  database: process.env.POSTGRES_DB,
  ssl: false,
});

export const query = (text: string, params?: string[]) =>
  pool.query(text, params);
