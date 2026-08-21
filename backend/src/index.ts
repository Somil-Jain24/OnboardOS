import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { env } from './config/env';
import { testSupabaseConnection } from './config/supabase';

dotenv.config();

const app = express();
const port = env.PORT || 3001;

app.use(cors({ origin: env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Health check endpoint
app.get('/health', async (_req: express.Request, res: express.Response) => {
  const supabaseStatus = await testSupabaseConnection();
  res.json({
    status: 'healthy',
    service: 'OnboardOS Core Backend API',
    database: {
      provider: 'Supabase PostgreSQL',
      projectId: 'vmtxrdtcdfqwlsjmomkz',
      url: env.SUPABASE_URL,
      connected: supabaseStatus.connected,
      message: supabaseStatus.message,
    },
    phases: ['Phase 2: Auth & RBAC & CRUD', 'Phase 3: Intelligence & Rules', 'Phase 4: Orchestration & DAG', 'Phase 5: Integrations & Ledger'],
    timestamp: new Date().toISOString(),
  });
});

// Mount all API routes
app.use('/api', apiRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`🚀 [OnboardOS Backend API] Running on http://localhost:${port}`);
    console.log(`📊 [API Base] http://localhost:${port}/api`);
    console.log(`🩺 [Health Check] http://localhost:${port}/health`);
  });
}

export default app;
