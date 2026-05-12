import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { ensureSchema, getPool } from './lib/db.js';
import profilesRouter from './routes/profiles.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());

// Strict CORS: allowlist dev frontends and enable credentials
const allowlist = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173,http://192.168.1.6:5173,http://192.168.1.8:5173,http://192.168.75.201:5173').split(',');
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow curl/postman and same-origin
    const ok = allowlist.includes(origin);
    return callback(null, ok);
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
