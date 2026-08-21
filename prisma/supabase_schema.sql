-- ============================================================================
-- OnboardOS Complete Supabase / PostgreSQL Schema Migration
-- Project Reference: vmtxrdtcdfqwlsjmomkz
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing enum types if present
DO $$ BEGIN
  CREATE TYPE seniority_level AS ENUM ('JUNIOR', 'MID', 'SENIOR', 'LEAD', 'PRINCIPAL', 'EXEC');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'CONTRACT', 'INTERN', 'VENDOR');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE employee_status AS ENUM ('INVITED', 'ACTIVE', 'EXITING', 'OFFBOARDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ADMIN', 'HR', 'IT', 'MANAGER', 'EMPLOYEE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE requirement_decision AS ENUM ('REQUIRED', 'OPTIONAL', 'NOT_APPLICABLE', 'APPROVAL_REQUIRED', 'BLOCKED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE plan_status AS ENUM ('DRAFT', 'ACTIVE', 'SUPERSEDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('PENDING', 'READY', 'RUNNING', 'COMPLETED', 'FAILED', 'WAITING_APPROVAL', 'BLOCKED', 'REJECTED', 'HUMAN_INTERVENTION', 'SKIPPED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE adapter_type AS ENUM ('GOOGLE', 'SLACK', 'GITHUB', 'JIRA', 'AWS', 'HRMS', 'SCIM', 'NONE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'MORE_INFO_REQUESTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ----------------------------------------------------------------------------
-- 1. Core Identity & Structure
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  level seniority_level DEFAULT 'JUNIOR',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role_id UUID REFERENCES roles(id),
  department_id UUID REFERENCES departments(id),
  team_id UUID REFERENCES teams(id),
  project_id UUID REFERENCES projects(id),
  manager_id UUID REFERENCES employees(id),
  seniority seniority_level DEFAULT 'JUNIOR',
  location VARCHAR(255) NOT NULL,
  employment_type employment_type DEFAULT 'FULL_TIME',
  status employee_status DEFAULT 'INVITED',
  start_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS employee_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  captured_at TIMESTAMPTZ DEFAULT now(),
  role_title VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  team VARCHAR(255) NOT NULL,
  seniority seniority_level NOT NULL,
  location VARCHAR(255) NOT NULL,
  employment_type employment_type NOT NULL,
  raw_vector JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role DEFAULT 'EMPLOYEE',
  employee_id UUID UNIQUE REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2. Policy & Intelligence Engine
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS requirement_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version INT DEFAULT 1,
  effective_from TIMESTAMPTZ DEFAULT now(),
  supersedes_id UUID REFERENCES requirement_rules(id),
  scope JSONB NOT NULL,
  requirement_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  decision requirement_decision NOT NULL,
  approval_chain JSONB,
  risk_level risk_level DEFAULT 'LOW',
  reason_template TEXT NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sod_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  severity risk_level DEFAULT 'HIGH',
  conflicting_entitlements JSONB NOT NULL,
  risk_explanation TEXT NOT NULL,
  enforcement_action VARCHAR(50) DEFAULT 'HARD_BLOCK'
);

-- ----------------------------------------------------------------------------
-- 3. Plan & Orchestration DAG
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS onboarding_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  employee_context_id UUID REFERENCES employee_contexts(id),
  rule_set_version INT DEFAULT 1,
  generated_at TIMESTAMPTZ DEFAULT now(),
  status plan_status DEFAULT 'ACTIVE',
  reasoning_sequence JSONB
);

CREATE TABLE IF NOT EXISTS plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES onboarding_plans(id) ON DELETE CASCADE,
  requirement_rule_id UUID REFERENCES requirement_rules(id),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  final_decision requirement_decision NOT NULL,
  reason TEXT NOT NULL,
  ai_confidence FLOAT,
  ai_rationale TEXT,
  risk_level risk_level DEFAULT 'LOW'
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_item_id UUID REFERENCES plan_items(id),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  status task_status DEFAULT 'PENDING',
  adapter_type adapter_type DEFAULT 'NONE',
  attempt INT DEFAULT 0,
  idempotency_key VARCHAR(255) UNIQUE,
  failure_code VARCHAR(100),
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  UNIQUE(task_id, depends_on_task_id)
);

CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  stage INT DEFAULT 1,
  approver_role user_role DEFAULT 'MANAGER',
  approver_user_id UUID REFERENCES users(id),
  status approval_status DEFAULT 'PENDING',
  requested_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  sla_target_at TIMESTAMPTZ,
  reason TEXT NOT NULL,
  response_note TEXT
);

-- ----------------------------------------------------------------------------
-- 4. Integrations & Distributed Ledger
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS integration_adapter_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  adapter_type adapter_type NOT NULL,
  operation VARCHAR(100) NOT NULL,
  idempotency_key VARCHAR(255) NOT NULL UNIQUE,
  success BOOLEAN NOT NULL,
  external_id VARCHAR(255),
  error_code VARCHAR(100),
  reason TEXT,
  payload JSONB,
  requested_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ
);

-- ----------------------------------------------------------------------------
-- 5. Governance, Access Packages & JIT
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS access_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  risk_level risk_level DEFAULT 'LOW',
  owner_user_id UUID REFERENCES users(id),
  max_duration_days INT DEFAULT 90,
  review_frequency_days INT DEFAULT 90,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES access_packages(id) ON DELETE CASCADE,
  app_name VARCHAR(100) NOT NULL,
  permission_name VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  risk_level risk_level DEFAULT 'LOW'
);

CREATE TABLE IF NOT EXISTS time_bound_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  entitlement_id UUID REFERENCES entitlements(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE'
);

-- ----------------------------------------------------------------------------
-- 6. Audit Logs (Cryptographic Append-Only Ledger)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role user_role NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  previous_state JSONB,
  new_state JSONB,
  reason TEXT,
  result VARCHAR(50),
  sha256_checksum VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Initial Organization & Seed Data
-- ----------------------------------------------------------------------------

INSERT INTO organizations (id, name, domain)
VALUES ('a0000000-0000-0000-0000-000000000001', 'OnboardOS Enterprise', 'onboardos.internal')
ON CONFLICT (domain) DO NOTHING;

INSERT INTO departments (id, org_id, name, code)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Engineering', 'ENG'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Design & Product', 'DES'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Human Resources', 'HR')
ON CONFLICT DO NOTHING;
