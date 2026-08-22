import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  JWT_SECRET: z.string().default('onboardos-super-secret-jwt-key-2026'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  SUPABASE_URL: z.string().default('https://vmtxrdtcdfqwlsjmomkz.supabase.co'),
  SUPABASE_ANON_KEY: z.string().default('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtdHhyZHRjZGZxd2xzam1vbWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyOTIwOTMsImV4cCI6MjEwMjg2ODA5M30.V9fkZNb732cKb844M04evzS8NRS1QCIQhdVnV68oa-4'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-3.6-flash'),
  SLACK_BOT_TOKEN: z.string().optional(),
  SLACK_REFRESH_TOKEN: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  JIRA_API_TOKEN: z.string().optional(),
  VIASOCKET_NEW_EMPLOYEE_WEBHOOK_URL: z.string().optional().default(''),
  VIASOCKET_OFFBOARDING_WEBHOOK_URL: z.string().optional().default(''),
  VIASOCKET_APPROVAL_WEBHOOK_URL: z.string().optional().default(''),
  VIASOCKET_TASK_FAILURE_WEBHOOK_URL: z.string().optional().default(''),
  VIASOCKET_RECOVERY_WEBHOOK_URL: z.string().optional().default(''),
  VIASOCKET_DAY_ONE_READY_WEBHOOK_URL: z.string().optional().default(''),
  APP_BASE_URL: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
