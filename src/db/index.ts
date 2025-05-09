//i mport { drizzle } from "drizzle-orm/neon-http";
import { drizzle } from 'drizzle-orm/better-sqlite3';
// export const db = drizzle(process.env.DATABASE_URL!);
export const db = drizzle(process.env.DATABASE_LOCAL_URL!);