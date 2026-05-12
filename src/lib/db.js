import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

let pool;

export async function getPool() {
  if (!pool) {
    // Ensure DB exists before creating pool bound to a database
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = Number(process.env.DB_PORT || 3306);
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || 'Dev@cdot123';
    const database = process.env.DB_NAME || 'betu_manager';

    // Create a temporary connection without selecting a database
    const conn = await mysql.createConnection({ host, port, user, password });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
    await conn.end();

    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  await pool.query(createTableSQL);
}
