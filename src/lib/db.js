import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
let pool;

export async function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/betu_manager';
    // If not localhost, we likely need SSL for Supabase/Neon/Render databases
    const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    
    pool = new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false }
    });
  }
  return pool;
}

export async function ensureSchema() {
  const pool = await getPool();

  const createTableSQL = `
  CREATE TABLE IF NOT EXISTS profiles (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      age INT,
      salary DECIMAL(15, 2),
      occupation VARCHAR(100),
      looks VARCHAR(100),
      height VARCHAR(50),
      managed_by VARCHAR(100),
      native VARCHAR(100),
      resident VARCHAR(100),
      college VARCHAR(100),
      surname VARCHAR(100),
      gotra VARCHAR(100),
      food VARCHAR(100),
      maanglik VARCHAR(50),
      family_background VARCHAR(100),
      final_verdict VARCHAR(50),
      notes TEXT,
      score INT,
      created_at BIGINT
  );
  `;

  await pool.query(createTableSQL);
}
