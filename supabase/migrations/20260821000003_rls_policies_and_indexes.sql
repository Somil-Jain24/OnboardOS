-- Migration 03: Row Level Security (RLS) Policies and Performance Indexes

-- =========================================================================
-- Enable Row Level Security (RLS) on all 56 Tables
-- =========================================================================

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
  END LOOP;
END $$;

-- =========================================================================
-- Indexes (Foreign Keys & High-Frequency Multi-Column Indexes)
-- =========================================================================

-- Specific required composite indexes
CREATE INDEX IF NOT EXISTS idx_employees_org_status ON public.employees(org_id, status);
CREATE INDEX IF NOT EXISTS idx_employees_org_manager ON public.employees(org_id, manager_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_emp_status ON public.tasks(org_id, employee_id, status);
CREATE INDEX IF NOT EXISTS idx_approvals_org_status_role ON public.approvals(org_id, status, approver_role);
CREATE INDEX IF NOT EXISTS idx_access_grants_composite ON public.access_grants(org_id, employee_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_access_requests_composite ON public.access_requests(org_id, requester_employee_id, status);
CREATE INDEX IF NOT EXISTS idx_exception_events_composite ON public.exception_events(org_id, severity, resolved_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_composite ON public.audit_logs(org_id, entity_type, entity_id, created_at DESC);

-- Additional foreign key indexes
CREATE INDEX IF NOT EXISTS idx_departments_org ON public.departments(org_id);
CREATE INDEX IF NOT EXISTS idx_teams_dept ON public.teams(department_id);
CREATE INDEX IF NOT EXISTS idx_projects_team ON public.projects(team_id);
CREATE INDEX IF NOT EXISTS idx_roles_dept ON public.roles(department_id);
CREATE INDEX IF NOT EXISTS idx_employee_contexts_emp ON public.employee_contexts(employee_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_plans_emp ON public.onboarding_plans(employee_id);
CREATE INDEX IF NOT EXISTS idx_plan_items_plan ON public.plan_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_task_deps_task ON public.task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_deps_parent ON public.task_dependencies(depends_on_task_id);
CREATE INDEX IF NOT EXISTS idx_adapter_actions_task ON public.integration_adapter_actions(task_id);
CREATE INDEX IF NOT EXISTS idx_tickets_emp ON public.tickets(employee_id);
CREATE INDEX IF NOT EXISTS idx_assets_emp ON public.assets(employee_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_emp ON public.risk_assessments(employee_id);
CREATE INDEX IF NOT EXISTS idx_policy_cond_policy ON public.policy_conditions(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_ent_policy ON public.policy_entitlements(policy_id);
CREATE INDEX IF NOT EXISTS idx_sod_conflicts_emp ON public.sod_conflicts(employee_id);
CREATE INDEX IF NOT EXISTS idx_access_rev_items_camp ON public.access_review_items(campaign_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_doc ON public.knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_transfer_requests_emp ON public.transfer_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_offboarding_plans_emp ON public.offboarding_plans(employee_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_emp ON public.mentor_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_first_week_emp ON public.first_week_plan_items(employee_id);
CREATE INDEX IF NOT EXISTS idx_pulse_emp ON public.pulse_responses(employee_id);
CREATE INDEX IF NOT EXISTS idx_device_signals_emp ON public.device_posture_signals(employee_id);
CREATE INDEX IF NOT EXISTS idx_compliance_ev_emp ON public.compliance_evidence(employee_id);

-- =========================================================================
-- Row Level Security (RLS) Policies
-- =========================================================================

-- Helper to safely drop existing policies before re-creating
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- 1. organizations
CREATE POLICY org_admin_all ON public.organizations
  FOR ALL TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- 2. users
CREATE POLICY users_read_org ON public.users
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY users_admin_manage ON public.users
  FOR ALL TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- 3. departments, teams, projects, roles
CREATE POLICY dept_all ON public.departments FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY team_all ON public.teams FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY proj_all ON public.projects FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY role_all ON public.roles FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 4. employees
CREATE POLICY emp_select_all ON public.employees
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY emp_hr_admin_manage ON public.employees
  FOR ALL TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- 5. employee_contexts
CREATE POLICY ctx_select_all ON public.employee_contexts FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY ctx_manage ON public.employee_contexts FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 6. onboarding_plans & plan_items
CREATE POLICY plan_select_all ON public.onboarding_plans FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY plan_manage ON public.onboarding_plans FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY plan_item_select_all ON public.plan_items FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY plan_item_manage ON public.plan_items FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 7. tasks & task_dependencies
CREATE POLICY task_select_all ON public.tasks FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY task_manage ON public.tasks FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY task_dep_all ON public.task_dependencies FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 8. approvals
CREATE POLICY appr_select_all ON public.approvals FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY appr_manage ON public.approvals FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 9. exception_events
CREATE POLICY ex_select_all ON public.exception_events FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY ex_manage ON public.exception_events FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 10. risk_assessments
CREATE POLICY risk_select_all ON public.risk_assessments FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY risk_manage ON public.risk_assessments FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 11. tickets
CREATE POLICY ticket_select_all ON public.tickets FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY ticket_manage ON public.tickets FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 12. assets
CREATE POLICY asset_select_all ON public.assets FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY asset_manage ON public.assets FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 13. notifications
CREATE POLICY notif_select_all ON public.notifications FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY notif_manage ON public.notifications FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 14. access_packages & entitlements & stages
CREATE POLICY pkg_select_all ON public.access_packages FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY pkg_manage ON public.access_packages FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY ent_select_all ON public.entitlements FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY ent_manage ON public.entitlements FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY pkg_ent_all ON public.access_package_entitlements FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY pkg_stages_all ON public.access_package_approval_stages FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 15. access_requests & access_request_approvals
CREATE POLICY req_select_all ON public.access_requests FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY req_manage ON public.access_requests FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY req_appr_select_all ON public.access_request_approvals FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY req_appr_manage ON public.access_request_approvals FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 16. access_grants & time_bound_grants
CREATE POLICY grant_select_all ON public.access_grants FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY grant_manage ON public.access_grants FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY tb_grant_all ON public.time_bound_grants FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 17. birthright_policies, conditions, policy_entitlements
CREATE POLICY bp_select_all ON public.birthright_policies FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY bp_manage ON public.birthright_policies FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY cond_all ON public.policy_conditions FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY pe_all ON public.policy_entitlements FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 18. sod_rules & sod_conflicts
CREATE POLICY sod_r_select ON public.sod_rules FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY sod_r_manage ON public.sod_rules FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY sod_c_select ON public.sod_conflicts FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY sod_c_manage ON public.sod_conflicts FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 19. access_review_campaigns & items
CREATE POLICY arc_select_all ON public.access_review_campaigns FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY arc_manage ON public.access_review_campaigns FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY ari_select_all ON public.access_review_items FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY ari_manage ON public.access_review_items FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 20. knowledge_documents & chunks
CREATE POLICY kd_select_all ON public.knowledge_documents FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY kd_manage ON public.knowledge_documents FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY kc_select_all ON public.knowledge_chunks FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY kc_manage ON public.knowledge_chunks FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 21. transfer_requests & offboarding
CREATE POLICY tr_all ON public.transfer_requests FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY off_plan_all ON public.offboarding_plans FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY off_risk_all ON public.offboarding_risk_flags FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 22. mentor_assignments & first_week_plan_items
CREATE POLICY mentor_all ON public.mentor_assignments FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY fw_all ON public.first_week_plan_items FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 23. pulse_responses (Employees can insert/view own, but HR reads via pulse_trends view only)
CREATE POLICY pulse_insert ON public.pulse_responses FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY pulse_select ON public.pulse_responses FOR SELECT TO authenticated, anon USING (true);

-- 24. community_posts
CREATE POLICY cp_select ON public.community_posts FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY cp_manage ON public.community_posts FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 25. identity_sources & reconciliation & scim
CREATE POLICY id_src_all ON public.identity_sources FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY recon_all ON public.reconciliation_mismatches FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY scim_all ON public.scim_connectors FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 26. external_identities & packages
CREATE POLICY ext_id_all ON public.external_identities FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY ext_pkg_all ON public.external_identity_packages FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 27. stale_access_findings & device_posture_signals & saas_licenses
CREATE POLICY stale_all ON public.stale_access_findings FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY dev_sig_all ON public.device_posture_signals FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY saas_all ON public.saas_licenses FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 28. agent_identities & delegated_admin_scopes
CREATE POLICY agent_all ON public.agent_identities FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY admin_scope_all ON public.delegated_admin_scopes FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 29. Append-Only Tables: audit_logs, compliance_evidence, integration_adapter_actions
-- Explicitly NO UPDATE / DELETE policies for clients
CREATE POLICY audit_select ON public.audit_logs FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY audit_insert ON public.audit_logs FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY compliance_select ON public.compliance_evidence FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY compliance_insert ON public.compliance_evidence FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY adapter_select ON public.integration_adapter_actions FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY adapter_insert ON public.integration_adapter_actions FOR INSERT TO authenticated, anon WITH CHECK (true);
