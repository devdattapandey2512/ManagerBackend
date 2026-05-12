import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { ensureSchema, getPool } from './lib/db.js';
import profilesRouter from './routes/profiles.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Flexible CORS for deployment
const corsOptions = {
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests for all routes

app.use(helmet());
app.use(express.json({ limit: '2mb' }));

app.get('/health', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use('/profiles', profilesRouter);

(async () => {
  try {
    await ensureSchema();
    app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
  } catch (e) {
    console.error('Failed to start server:', e);
    process.exit(1);
  }
})();
