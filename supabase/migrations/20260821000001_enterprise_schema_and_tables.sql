-- Migration 01: Core Extensions, Compatibility Columns, and Tables (1 to 36)
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA public;

-- Ensure default organization exists
INSERT INTO public.organizations (id, name, domain, created_at)
VALUES ('a0000000-0000-0000-0000-000000000001', 'OnboardOS Enterprise', 'onboardos.internal', now())
ON CONFLICT (id) DO NOTHING;

-- 1. Ensure existing tables have org_id and standard compat fields
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) DEFAULT 'a0000000-0000-0000-0000-000000000001';

ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) DEFAULT 'a0000000-0000-0000-0000-000000000001';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) DEFAULT 'a0000000-0000-0000-0000-000000000001';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) DEFAULT 'a0000000-0000-0000-0000-000000000001';
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) DEFAULT 'a0000000-0000-0000-0000-000000000001';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) DEFAULT 'a0000000-0000-0000-0000-000000000001';
ALTER TABLE public.employee_contexts ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) DEFAULT 'a0000000-0000-0000-0000-000000000001';
ALTER TABLE public.requirement_rules ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) DEFAULT 'a0000000-0000-0000-0000-000000000001';
ALTER TABLE public.sod_rules ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) DEFAULT 'a0000000-0000-0000-0000-000000000001';
ALTER TABLE public.onboarding_plans ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) DEFAULT 'a0000000-0000-0000-0000-000000000001';
ALTER TABLE public.plan_items ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) DEFAULT 'a0000000-0000-0000-0000-000000000001';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) DEFAULT 'a0000000-0000-0000-0000-000000000001';
ALTER TABLE public.task_dependencies ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) DEFAULT 'a0000000-0000-0000-0000-000000000001';
ALTER TABLE public.approvals ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) DEFAULT 'a0000000-0000-0000-0000-000000000001';
ALTER TABLE public.integration_adapter_actions ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) DEFAULT 'a0000000-0000-0000-0000-000000000001';
ALTER TABLE public.access_packages ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) DEFAULT 'a0000000-0000-0000-0000-000000000001';
ALTER TABLE public.entitlements ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) DEFAULT 'a0000000-0000-0000-0000-000000000001';
ALTER TABLE public.time_bound_grants ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) DEFAULT 'a0000000-0000-0000-0000-000000000001';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) DEFAULT 'a0000000-0000-0000-0000-000000000001';

-- =========================================================================
-- A. Core Operational Tables (1 to 5)
-- =========================================================================

-- 1. notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  priority TEXT NOT NULL CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')) DEFAULT 'MEDIUM',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  ref_type TEXT,
  ref_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. exception_events
CREATE TABLE IF NOT EXISTS public.exception_events (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  approval_id UUID REFERENCES public.approvals(id) ON DELETE SET NULL,
  severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'ACTION_REQUIRED', 'WARNING', 'RESOLVED')) DEFAULT 'WARNING',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- 3. risk_assessments
CREATE TABLE IF NOT EXISTS public.risk_assessments (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'LOW',
  factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  day_one_ready BOOLEAN NOT NULL DEFAULT false,
  readiness_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 4. tickets
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
  assigned_team TEXT DEFAULT 'IT Operations',
  status TEXT NOT NULL CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')) DEFAULT 'OPEN',
  description TEXT NOT NULL,
  ai_classification JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT
);

-- 5. assets
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  asset_type TEXT NOT NULL,
  asset_tag TEXT NOT NULL UNIQUE,
  model TEXT,
  serial_number TEXT UNIQUE,
  state TEXT NOT NULL CHECK (state IN ('ASSIGNED', 'RECEIVED', 'DAMAGED', 'LOST', 'RETURNED')) DEFAULT 'ASSIGNED',
  assigned_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- B. Access Governance Tables (6 to 16)
-- =========================================================================

-- 6. access_grants
CREATE TABLE IF NOT EXISTS public.access_grants (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  entitlement_id UUID NOT NULL REFERENCES public.entitlements(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.access_packages(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('BIRTHRIGHT_POLICY', 'ACCESS_REQUEST', 'MANUAL', 'ONBOARDING_PLAN', 'JIT')) DEFAULT 'MANUAL',
  source_id UUID,
  granted_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  revoke_reason TEXT,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'REVOKED', 'RENEWED')) DEFAULT 'ACTIVE',
  renewal_eligible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_grant 
ON public.access_grants(employee_id, entitlement_id) 
WHERE status = 'ACTIVE';

-- 7. access_requests
CREATE TABLE IF NOT EXISTS public.access_requests (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  package_id UUID NOT NULL REFERENCES public.access_packages(id) ON DELETE CASCADE,
  requester_employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  justification TEXT NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PROVISIONED', 'EXPIRED', 'CANCELLED')) DEFAULT 'PENDING',
  current_stage INTEGER NOT NULL DEFAULT 1,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. access_request_approvals
CREATE TABLE IF NOT EXISTS public.access_request_approvals (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  access_request_id UUID NOT NULL REFERENCES public.access_requests(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL,
  approver_role TEXT NOT NULL CHECK (approver_role IN ('MANAGER', 'RESOURCE_OWNER', 'SECURITY', 'ADMIN')),
  approver_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
  comments TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (access_request_id, stage)
);

-- 9. access_package_entitlements
CREATE TABLE IF NOT EXISTS public.access_package_entitlements (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  package_id UUID NOT NULL REFERENCES public.access_packages(id) ON DELETE CASCADE,
  entitlement_id UUID NOT NULL REFERENCES public.entitlements(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (package_id, entitlement_id)
);

-- 10. access_package_approval_stages
CREATE TABLE IF NOT EXISTS public.access_package_approval_stages (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  package_id UUID NOT NULL REFERENCES public.access_packages(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL,
  approver_role TEXT NOT NULL,
  sla_hours INTEGER NOT NULL DEFAULT 24,
  auto_approve_condition TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (package_id, stage)
);

-- 11. birthright_policies
CREATE TABLE IF NOT EXISTS public.birthright_policies (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('BIRTHRIGHT', 'APPROVAL_REQUIRED', 'OPTIONAL', 'DENIED', 'TIME_BOUND', 'CONDITIONAL')) DEFAULT 'BIRTHRIGHT',
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'DRAFT', 'ARCHIVED')) DEFAULT 'ACTIVE',
  priority INTEGER NOT NULL DEFAULT 10,
  approval_chain JSONB,
  version INTEGER NOT NULL DEFAULT 1,
  author_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. policy_conditions
CREATE TABLE IF NOT EXISTS public.policy_conditions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  policy_id UUID NOT NULL REFERENCES public.birthright_policies(id) ON DELETE CASCADE,
  field TEXT NOT NULL,
  operator TEXT NOT NULL CHECK (operator IN ('EQUALS', 'CONTAINS', 'IN', 'NOT_EQUALS')),
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. policy_entitlements
CREATE TABLE IF NOT EXISTS public.policy_entitlements (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  policy_id UUID NOT NULL REFERENCES public.birthright_policies(id) ON DELETE CASCADE,
  entitlement_id UUID NOT NULL REFERENCES public.entitlements(id) ON DELETE CASCADE,
  decision TEXT NOT NULL CHECK (decision IN ('REQUIRED', 'OPTIONAL', 'NOT_APPLICABLE', 'APPROVAL_REQUIRED', 'BLOCKED')) DEFAULT 'REQUIRED',
  ttl_hours INTEGER,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (policy_id, entitlement_id)
);

-- 14. sod_conflicts
CREATE TABLE IF NOT EXISTS public.sod_conflicts (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  sod_rule_id UUID NOT NULL REFERENCES public.sod_rules(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  existing_grant_id UUID REFERENCES public.access_grants(id) ON DELETE SET NULL,
  requested_entitlement_id UUID REFERENCES public.entitlements(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE_VIOLATION', 'BLOCKED_REQUEST', 'OVERRIDDEN_APPROVED')) DEFAULT 'ACTIVE_VIOLATION',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  compensating_control_note TEXT,
  approved_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ
);

-- 15. access_review_campaigns
CREATE TABLE IF NOT EXISTS public.access_review_campaigns (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  scope JSONB NOT NULL DEFAULT '{}'::jsonb,
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'DRAFT', 'COMPLETED', 'OVERDUE')) DEFAULT 'ACTIVE',
  reviewer_role TEXT NOT NULL DEFAULT 'MANAGER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. access_review_items
CREATE TABLE IF NOT EXISTS public.access_review_items (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  campaign_id UUID NOT NULL REFERENCES public.access_review_campaigns(id) ON DELETE CASCADE,
  access_grant_id UUID NOT NULL REFERENCES public.access_grants(id) ON DELETE CASCADE,
  reviewer_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  decision TEXT CHECK (decision IN ('CERTIFY', 'REVOKE', 'REVOKE_WITH_EXCEPTION')),
  decided_at TIMESTAMPTZ,
  justification TEXT,
  peer_comparison JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, access_grant_id)
);

-- =========================================================================
-- C. Employee Experience & Advanced Operational Tables (17 to 36)
-- =========================================================================

-- 17. knowledge_documents
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  source TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. knowledge_chunks
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  document_id UUID NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. transfer_requests
CREATE TABLE IF NOT EXISTS public.transfer_requests (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  from_context_id UUID REFERENCES public.employee_contexts(id) ON DELETE SET NULL,
  to_context JSONB NOT NULL,
  diff_access_added JSONB NOT NULL DEFAULT '[]'::jsonb,
  diff_access_removed JSONB NOT NULL DEFAULT '[]'::jsonb,
  diff_approvals JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'APPLIED')) DEFAULT 'DRAFT',
  applied_at TIMESTAMPTZ,
  created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. offboarding_plans
CREATE TABLE IF NOT EXISTS public.offboarding_plans (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  exit_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETE')) DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 21. offboarding_risk_flags
CREATE TABLE IF NOT EXISTS public.offboarding_risk_flags (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  system_name TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'WARNING')) DEFAULT 'CRITICAL',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- 22. mentor_assignments
CREATE TABLE IF NOT EXISTS public.mentor_assignments (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  mentor_name TEXT NOT NULL,
  mentor_role TEXT NOT NULL,
  mentor_email TEXT NOT NULL,
  mentor_slack TEXT NOT NULL,
  buddy_name TEXT,
  buddy_role TEXT,
  buddy_email TEXT,
  buddy_slack TEXT,
  scheduled_syncs JSONB NOT NULL DEFAULT '[]'::jsonb,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 23. first_week_plan_items
CREATE TABLE IF NOT EXISTS public.first_week_plan_items (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  day INTEGER NOT NULL CHECK (day BETWEEN 1 AND 5),
  time_slot TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('SETUP', 'MEETING', 'TRAINING', 'CHECKIN')),
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 24. pulse_responses
CREATE TABLE IF NOT EXISTS public.pulse_responses (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  value TEXT NOT NULL CHECK (value IN ('GREAT', 'GOOD', 'OKAY', 'STRUGGLING')),
  note TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 25. community_posts
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  author_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ANNOUNCEMENT', 'EVENT', 'UPDATE', 'POLL', 'KNOWLEDGE')) DEFAULT 'ANNOUNCEMENT',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 26. identity_sources
CREATE TABLE IF NOT EXISTS public.identity_sources (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('HRMS', 'IDP', 'DIRECTORY')),
  is_authoritative BOOLEAN NOT NULL DEFAULT false,
  last_sync_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  account_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('HEALTHY', 'SYNC_IN_PROGRESS', 'DRIFT_DETECTED')) DEFAULT 'HEALTHY',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 27. reconciliation_mismatches
CREATE TABLE IF NOT EXISTS public.reconciliation_mismatches (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  attribute_name TEXT NOT NULL,
  authoritative_value TEXT NOT NULL,
  target_system TEXT NOT NULL,
  target_system_value TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('UNRESOLVED', 'AUTO_REMEDIATED', 'IGNORED')) DEFAULT 'UNRESOLVED',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- 28. scim_connectors
CREATE TABLE IF NOT EXISTS public.scim_connectors (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  app_name TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  scim_version TEXT NOT NULL DEFAULT 'SCIM 2.0',
  auth_type TEXT NOT NULL CHECK (auth_type IN ('BEARER_TOKEN', 'OAUTH2')) DEFAULT 'BEARER_TOKEN',
  encrypted_token TEXT,
  supports_users BOOLEAN NOT NULL DEFAULT true,
  supports_groups BOOLEAN NOT NULL DEFAULT true,
  last_health_check TIMESTAMPTZ NOT NULL DEFAULT now(),
  sync_success_rate NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  total_synced_users INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('ONLINE', 'DEGRADED', 'OFFLINE')) DEFAULT 'ONLINE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 29. external_identities
CREATE TABLE IF NOT EXISTS public.external_identities (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  identity_type TEXT NOT NULL CHECK (identity_type IN ('CONTRACTOR', 'VENDOR', 'PARTNER', 'INTERN', 'GUEST', 'SERVICE_ACCOUNT')),
  sponsor_name TEXT NOT NULL,
  sponsor_email TEXT NOT NULL,
  start_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'REVOKED')) DEFAULT 'ACTIVE',
  business_purpose TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 30. external_identity_packages
CREATE TABLE IF NOT EXISTS public.external_identity_packages (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  external_identity_id UUID NOT NULL REFERENCES public.external_identities(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.access_packages(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (external_identity_id, package_id)
);

-- 31. stale_access_findings
CREATE TABLE IF NOT EXISTS public.stale_access_findings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  entitlement_id UUID REFERENCES public.entitlements(id) ON DELETE SET NULL,
  entitlement_name TEXT NOT NULL,
  app_name TEXT NOT NULL,
  days_inactive INTEGER NOT NULL,
  last_activity_at TIMESTAMPTZ NOT NULL,
  monthly_cost_usd NUMERIC(10,2) DEFAULT 0,
  risk_score INTEGER NOT NULL DEFAULT 50,
  recommendation TEXT NOT NULL CHECK (recommendation IN ('REVOKE_IMMEDIATE', 'SCHEDULE_REVIEW', 'DOWNGRADE_TIER')),
  status TEXT NOT NULL CHECK (status IN ('FLAGGED', 'REVOKED', 'KEPT_WITH_JUSTIFICATION')) DEFAULT 'FLAGGED',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 32. device_posture_signals
CREATE TABLE IF NOT EXISTS public.device_posture_signals (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  device_id TEXT NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL,
  management_status TEXT NOT NULL CHECK (management_status IN ('MANAGED', 'UNMANAGED')),
  compliance_status TEXT NOT NULL CHECK (compliance_status IN ('COMPLIANT', 'NON_COMPLIANT', 'UNKNOWN')),
  disk_encrypted BOOLEAN NOT NULL DEFAULT true,
  os_version TEXT NOT NULL,
  trust_score INTEGER NOT NULL DEFAULT 100,
  last_checkin_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 33. saas_licenses
CREATE TABLE IF NOT EXISTS public.saas_licenses (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  app_name TEXT NOT NULL,
  tier TEXT NOT NULL,
  total_seats INTEGER NOT NULL,
  assigned_seats INTEGER NOT NULL,
  inactive_seats_30d INTEGER NOT NULL DEFAULT 0,
  cost_per_seat_monthly NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('OPTIMAL', 'RECLAIM_RECOMMENDED', 'OVER_ALLOCATED')) DEFAULT 'OPTIMAL',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 34. agent_identities
CREATE TABLE IF NOT EXISTS public.agent_identities (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('AI_AGENT', 'SERVICE_ACCOUNT', 'CI_CD_BOT')),
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  allowed_tools JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_privilege_level TEXT NOT NULL CHECK (max_privilege_level IN ('READ_ONLY', 'SCOPED_WRITE', 'CLUSTER_ADMIN')),
  environment TEXT NOT NULL CHECK (environment IN ('PRODUCTION', 'DEVELOPMENT')) DEFAULT 'DEVELOPMENT',
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'PAUSED', 'EXPIRED')) DEFAULT 'ACTIVE',
  last_run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 35. delegated_admin_scopes
CREATE TABLE IF NOT EXISTS public.delegated_admin_scopes (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  admin_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  admin_name TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('APPLICATION_OWNER', 'RESOURCE_OWNER', 'DEPARTMENT_SECURITY_LEAD')),
  assigned_scope TEXT NOT NULL,
  can_approve BOOLEAN NOT NULL DEFAULT true,
  can_review BOOLEAN NOT NULL DEFAULT true,
  can_manage_policies BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 36. compliance_evidence
CREATE TABLE IF NOT EXISTS public.compliance_evidence (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT 'a0000000-0000-0000-0000-000000000001',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('GRANT', 'REVOKE', 'EXPIRE', 'CERTIFY', 'ELEVATE', 'TRANSFER')),
  entitlement_name TEXT NOT NULL,
  system_name TEXT NOT NULL,
  authorized_by_policy TEXT NOT NULL,
  approved_by TEXT NOT NULL,
  workflow_id TEXT NOT NULL,
  evidence_checksum TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
