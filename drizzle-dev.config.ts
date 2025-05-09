import dotenv from "dotenv";
import { defineConfig } from 'drizzle-kit';

dotenv.config({ path: ".env.local" });

export default defineConfig({
  out: './drizzle',
  schema: './src/db/local-schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_LOCAL_URL!,
  },
});