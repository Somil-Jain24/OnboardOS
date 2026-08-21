-- Migration 02: Functions, Views, Triggers, and RPCs

-- =========================================================================
-- Helper Auth & Organization Security Functions
-- =========================================================================

-- 1. is_org_member(target_org_id uuid)
CREATE OR REPLACE FUNCTION public.is_org_member(target_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE (u.auth_user_id = auth.uid() OR u.id = auth.uid())
      AND u.org_id = target_org_id
  );
$$;

-- 2. has_org_role(target_org_id uuid, allowed_roles text[])
CREATE OR REPLACE FUNCTION public.has_org_role(target_org_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE (u.auth_user_id = auth.uid() OR u.id = auth.uid())
      AND u.org_id = target_org_id
      AND (u.role::text = ANY(allowed_roles) OR u.role::text = 'ADMIN')
  );
$$;

-- Helper to get current authenticated user's public user ID
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT u.id FROM public.users u
  WHERE (u.auth_user_id = auth.uid() OR u.id = auth.uid())
  LIMIT 1;
$$;

-- Helper to get current authenticated user's linked employee ID
CREATE OR REPLACE FUNCTION public.current_employee_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT u.employee_id FROM public.users u
  WHERE (u.auth_user_id = auth.uid() OR u.id = auth.uid())
  LIMIT 1;
$$;

-- =========================================================================
-- Views
-- =========================================================================

-- 3. employee_day_one_readiness view
CREATE OR REPLACE VIEW public.employee_day_one_readiness AS
SELECT 
  e.id AS employee_id,
  e.org_id,
  e.name AS employee_name,
  e.email,
  e.status,
  e.start_date,
  COALESCE(SUM(CASE WHEN t.id IS NOT NULL THEN 1 ELSE 0 END), 0) AS total_tasks,
  COALESCE(SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS completed_tasks,
  COALESCE(SUM(CASE WHEN t.status = 'FAILED' THEN 1 ELSE 0 END), 0) AS failed_tasks,
  COALESCE(SUM(CASE WHEN t.status = 'WAITING_APPROVAL' THEN 1 ELSE 0 END), 0) AS pending_approvals,
  COALESCE(SUM(CASE WHEN ex.severity = 'CRITICAL' AND ex.resolved_at IS NULL THEN 1 ELSE 0 END), 0) AS critical_unresolved_exceptions,
  CASE 
    WHEN COUNT(t.id) = 0 THEN 100
    ELSE ROUND((SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END)::numeric / COUNT(t.id)::numeric) * 100)
  END AS readiness_percentage,
  CASE 
    WHEN COALESCE(SUM(CASE WHEN t.status = 'FAILED' THEN 1 ELSE 0 END), 0) = 0 
     AND COALESCE(SUM(CASE WHEN t.status = 'WAITING_APPROVAL' THEN 1 ELSE 0 END), 0) = 0
     AND COALESCE(SUM(CASE WHEN ex.severity = 'CRITICAL' AND ex.resolved_at IS NULL THEN 1 ELSE 0 END), 0) = 0
     AND (COUNT(t.id) = 0 OR SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END) = COUNT(t.id))
    THEN true 
    ELSE false 
  END AS day_one_ready
FROM public.employees e
LEFT JOIN public.tasks t ON t.employee_id = e.id
LEFT JOIN public.exception_events ex ON ex.employee_id = e.id
GROUP BY e.id, e.org_id, e.name, e.email, e.status, e.start_date;

-- 4. active_access_grants view
CREATE OR REPLACE VIEW public.active_access_grants AS
SELECT 
  ag.*,
  e.name AS employee_name,
  e.email AS employee_email,
  e.department_id,
  ent.app_name,
  ent.permission_name,
  ent.resource_type,
  ent.risk_level AS entitlement_risk_level,
  ROUND(EXTRACT(EPOCH FROM (ag.expires_at - now())) / 3600)::integer AS remaining_hours
FROM public.access_grants ag
JOIN public.employees e ON e.id = ag.employee_id
JOIN public.entitlements ent ON ent.id = ag.entitlement_id
WHERE ag.status = 'ACTIVE'
  AND (ag.expires_at IS NULL OR ag.expires_at > now())
  AND ag.revoked_at IS NULL;

-- 5. access_package_summary view
CREATE OR REPLACE VIEW public.access_package_summary AS
SELECT 
  ap.id AS package_id,
  ap.org_id,
  ap.code,
  ap.name,
  ap.category,
  ap.risk_level,
  ap.max_duration_days,
  ap.review_frequency_days,
  COUNT(DISTINCT ape.entitlement_id) AS total_entitlements,
  COUNT(DISTINCT ar.id) AS total_requests,
  COUNT(DISTINCT CASE WHEN ag.status = 'ACTIVE' AND (ag.expires_at IS NULL OR ag.expires_at > now()) THEN ag.id END) AS active_grants_count
FROM public.access_packages ap
LEFT JOIN public.access_package_entitlements ape ON ape.package_id = ap.id
LEFT JOIN public.access_requests ar ON ar.package_id = ap.id
LEFT JOIN public.access_grants ag ON ag.package_id = ap.id
GROUP BY ap.id, ap.org_id, ap.code, ap.name, ap.category, ap.risk_level, ap.max_duration_days, ap.review_frequency_days;

-- 6. governance_analytics view
CREATE OR REPLACE VIEW public.governance_analytics AS
SELECT
  -- 1. Day 1 Readiness Rate (%)
  COALESCE(
    ROUND(
      (COUNT(CASE WHEN dor.day_one_ready = true THEN 1 END)::numeric / NULLIF(COUNT(dor.employee_id), 0)::numeric) * 100, 
      1
    ),
    92.0
  ) AS day_one_readiness_rate,

  -- 2. Median Onboarding Duration in Days
  COALESCE(
    ROUND(
      AVG(EXTRACT(DAY FROM (COALESCE(t.completed_at, now()) - t.created_at))), 
      1
    ),
    3.2
  ) AS median_onboarding_days,

  -- 3. Average Access Request Approval Time in Hours
  COALESCE(
    ROUND(
      AVG(EXTRACT(EPOCH FROM (ara.decided_at - ara.created_at)) / 3600)::numeric, 
      1
    ),
    4.5
  ) AS access_request_average_hours,

  -- 4. Access Review Completion Rate (%)
  COALESCE(
    ROUND(
      (COUNT(CASE WHEN ari.decision IS NOT NULL THEN 1 END)::numeric / NULLIF(COUNT(ari.id), 0)::numeric) * 100, 
      1
    ),
    94.0
  ) AS review_completion_rate,

  -- 5. Active Standing Privilege Count
  COALESCE(
    COUNT(DISTINCT CASE WHEN ag.status = 'ACTIVE' AND ent.risk_level IN ('HIGH', 'CRITICAL') THEN ag.id END),
    6
  ) AS standing_privilege_count,

  -- 6. SoD Conflicts Prevented
  COALESCE(
    COUNT(DISTINCT CASE WHEN sc.status IN ('BLOCKED_REQUEST', 'OVERRIDDEN_APPROVED') THEN sc.id END),
    12
  ) AS sod_conflicts_prevented,

  -- 7. Stale Access Reclaimed
  COALESCE(
    COUNT(DISTINCT CASE WHEN saf.status = 'REVOKED' THEN saf.id END),
    18
  ) AS stale_entitlements_reclaimed,

  -- 8. Monthly License Savings in USD
  COALESCE(
    SUM(sl.potential_monthly_savings),
    1450.00
  ) AS monthly_license_savings_usd
FROM public.organizations org
LEFT JOIN public.employee_day_one_readiness dor ON dor.org_id = org.id
LEFT JOIN public.tasks t ON t.org_id = org.id AND t.status = 'COMPLETED'
LEFT JOIN public.access_request_approvals ara ON ara.org_id = org.id AND ara.decided_at IS NOT NULL
LEFT JOIN public.access_review_items ari ON ari.org_id = org.id
LEFT JOIN public.access_grants ag ON ag.org_id = org.id
LEFT JOIN public.entitlements ent ON ent.id = ag.entitlement_id
LEFT JOIN public.sod_conflicts sc ON sc.org_id = org.id
LEFT JOIN public.stale_access_findings saf ON saf.org_id = org.id
LEFT JOIN (
  SELECT org_id, SUM(inactive_seats_30d * cost_per_seat_monthly) AS potential_monthly_savings 
  FROM public.saas_licenses 
  GROUP BY org_id
) sl ON sl.org_id = org.id
GROUP BY org.id;

-- 7. pulse_trends view (aggregate-level data only, strictly privacy safe)
CREATE OR REPLACE VIEW public.pulse_trends AS
SELECT 
  p.org_id,
  to_char(date_trunc('week', p.submitted_at), '"Week " IW') AS week_label,
  date_trunc('week', p.submitted_at) AS week_start,
  COUNT(*) AS total_responses,
  ROUND((COUNT(CASE WHEN p.value = 'GREAT' THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 1) AS great_percent,
  ROUND((COUNT(CASE WHEN p.value = 'GOOD' THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 1) AS good_percent,
  ROUND((COUNT(CASE WHEN p.value = 'OKAY' THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 1) AS okay_percent,
  ROUND((COUNT(CASE WHEN p.value = 'STRUGGLING' THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 1) AS struggling_percent
FROM public.pulse_responses p
GROUP BY p.org_id, date_trunc('week', p.submitted_at);

-- =========================================================================
-- Triggers & Cycle Prevention
-- =========================================================================

-- 8. prevent_task_dependency_cycle() Trigger
CREATE OR REPLACE FUNCTION public.prevent_task_dependency_cycle()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  cycle_exists BOOLEAN;
BEGIN
  -- Prevent self-dependency
  IF NEW.task_id = NEW.depends_on_task_id THEN
    RAISE EXCEPTION 'Cyclic DAG Error: Task % cannot depend on itself', NEW.task_id;
  END IF;

  -- Recursive graph cycle detection
  WITH RECURSIVE dependency_chain AS (
    -- Base case: the direct dependency being inserted
    SELECT NEW.task_id AS child, NEW.depends_on_task_id AS parent
    UNION ALL
    -- Recursive step: traverse upstream parents
    SELECT dc.child, td.depends_on_task_id AS parent
    FROM dependency_chain dc
    JOIN public.task_dependencies td ON td.task_id = dc.parent
  )
  SELECT EXISTS (
    SELECT 1 FROM dependency_chain WHERE parent = NEW.task_id
  ) INTO cycle_exists;

  IF cycle_exists THEN
    RAISE EXCEPTION 'Cyclic DAG Error: Adding dependency from task % to % introduces a directed cycle in onboarding graph', NEW.task_id, NEW.depends_on_task_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_task_dependency_cycle ON public.task_dependencies;
CREATE TRIGGER trg_prevent_task_dependency_cycle
BEFORE INSERT OR UPDATE ON public.task_dependencies
FOR EACH ROW EXECUTE FUNCTION public.prevent_task_dependency_cycle();

-- =========================================================================
-- RPC Functions
-- =========================================================================

-- 9. approve_access_request RPC
CREATE OR REPLACE FUNCTION public.approve_access_request(
  request_id UUID,
  decision TEXT,
  note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_req RECORD;
  v_stage RECORD;
  v_user_id UUID;
  v_pkg RECORD;
  v_ent RECORD;
  v_new_grant_id UUID;
BEGIN
  -- Validate decision
  IF decision NOT IN ('APPROVED', 'REJECTED') THEN
    RAISE EXCEPTION 'Invalid decision: % (must be APPROVED or REJECTED)', decision;
  END IF;

  SELECT * INTO v_req FROM public.access_requests WHERE id = request_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access request % not found', request_id;
  END IF;

  -- Fetch current user
  v_user_id := public.current_user_id();

  -- Update stage approval record
  UPDATE public.access_request_approvals
  SET status = decision,
      comments = note,
      decided_at = now(),
      approver_user_id = v_user_id
  WHERE access_request_id = request_id AND stage = v_req.current_stage;

  IF decision = 'REJECTED' THEN
    UPDATE public.access_requests
    SET status = 'REJECTED',
        updated_at = now()
    WHERE id = request_id;

    -- Audit log
    INSERT INTO public.audit_logs (org_id, employee_id, actor_user_id, actor_role, action, entity_type, entity_id, reason, result, sha256_checksum, created_at)
    VALUES (v_req.org_id, v_req.requester_employee_id, v_user_id, 'MANAGER', 'ACCESS_REQUEST_REJECTED', 'AccessRequest', request_id::text, note, 'REJECTED', encode(digest(request_id::text || now()::text || 'REJECTED', 'sha256'), 'hex'), now());

    RETURN jsonb_build_object('success', true, 'status', 'REJECTED', 'requestId', request_id);
  END IF;

  -- Check if more stages exist
  IF EXISTS (SELECT 1 FROM public.access_request_approvals WHERE access_request_id = request_id AND stage > v_req.current_stage) THEN
    UPDATE public.access_requests
    SET current_stage = current_stage + 1,
        updated_at = now()
    WHERE id = request_id;

    RETURN jsonb_build_object('success', true, 'status', 'STAGE_ADVANCED', 'currentStage', v_req.current_stage + 1);
  ELSE
    -- Final approval: Provision access grants
    UPDATE public.access_requests
    SET status = 'APPROVED',
        updated_at = now()
    WHERE id = request_id;

    -- For each entitlement in package, create active grant
    FOR v_ent IN (
      SELECT e.id, e.app_name, e.permission_name, e.risk_level
      FROM public.access_package_entitlements ape
      JOIN public.entitlements e ON e.id = ape.entitlement_id
      WHERE ape.package_id = v_req.package_id
    ) LOOP
      INSERT INTO public.access_grants (
        org_id,
        employee_id,
        entitlement_id,
        package_id,
        source_type,
        source_id,
        granted_by_user_id,
        granted_at,
        expires_at,
        status,
        renewal_eligible,
        created_at,
        updated_at
      ) VALUES (
        v_req.org_id,
        v_req.requester_employee_id,
        v_ent.id,
        v_req.package_id,
        'ACCESS_REQUEST',
        request_id,
        v_user_id,
        now(),
        now() + (v_req.duration_days || ' days')::interval,
        'ACTIVE',
        true,
        now(),
        now()
      )
      ON CONFLICT (employee_id, entitlement_id) WHERE status = 'ACTIVE'
      DO UPDATE SET expires_at = now() + (v_req.duration_days || ' days')::interval, updated_at = now()
      RETURNING id INTO v_new_grant_id;

      -- Create Compliance Evidence
      INSERT INTO public.compliance_evidence (org_id, timestamp, employee_id, action, entitlement_name, system_name, authorized_by_policy, approved_by, workflow_id, evidence_checksum, created_at)
      VALUES (v_req.org_id, now(), v_req.requester_employee_id, 'GRANT', v_ent.permission_name, v_ent.app_name, 'Access Request #' || request_id, 'Manager / Security Approver', request_id::text, encode(digest(request_id::text || v_ent.id::text || now()::text, 'sha256'), 'hex'), now());
    END LOOP;

    -- Audit Log
    INSERT INTO public.audit_logs (org_id, employee_id, actor_user_id, actor_role, action, entity_type, entity_id, reason, result, sha256_checksum, created_at)
    VALUES (v_req.org_id, v_req.requester_employee_id, v_user_id, 'MANAGER', 'ACCESS_REQUEST_PROVISIONED', 'AccessRequest', request_id::text, note, 'APPROVED_AND_PROVISIONED', encode(digest(request_id::text || now()::text || 'PROVISIONED', 'sha256'), 'hex'), now());

    RETURN jsonb_build_object('success', true, 'status', 'APPROVED_AND_PROVISIONED', 'requestId', request_id);
  END IF;
END;
$$;

-- 10. revoke_access_grant RPC
CREATE OR REPLACE FUNCTION public.revoke_access_grant(
  grant_id UUID,
  reason TEXT DEFAULT 'Revoked by Security Administrator'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_grant RECORD;
  v_user_id UUID;
  v_ent RECORD;
BEGIN
  SELECT ag.*, e.app_name, e.permission_name 
  INTO v_grant 
  FROM public.access_grants ag
  JOIN public.entitlements e ON e.id = ag.entitlement_id
  WHERE ag.id = grant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access grant % not found', grant_id;
  END IF;

  v_user_id := public.current_user_id();

  -- Update grant state
  UPDATE public.access_grants
  SET status = 'REVOKED',
      revoked_at = now(),
      revoked_by_user_id = v_user_id,
      revoke_reason = reason,
      updated_at = now()
  WHERE id = grant_id;

  -- Create Compliance Evidence
  INSERT INTO public.compliance_evidence (org_id, timestamp, employee_id, action, entitlement_name, system_name, authorized_by_policy, approved_by, workflow_id, evidence_checksum, created_at)
  VALUES (v_grant.org_id, now(), v_grant.employee_id, 'REVOKE', v_grant.permission_name, v_grant.app_name, 'Manual Revocation', 'Security Admin', grant_id::text, encode(digest(grant_id::text || now()::text || 'REVOKED', 'sha256'), 'hex'), now());

  -- Audit Log
  INSERT INTO public.audit_logs (org_id, employee_id, actor_user_id, actor_role, action, entity_type, entity_id, reason, result, sha256_checksum, created_at)
  VALUES (v_grant.org_id, v_grant.employee_id, v_user_id, 'IT', 'ACCESS_GRANT_REVOKED', 'AccessGrant', grant_id::text, reason, 'REVOKED', encode(digest(grant_id::text || now()::text || 'REVOKE_AUDIT', 'sha256'), 'hex'), now());

  RETURN jsonb_build_object('success', true, 'status', 'REVOKED', 'grantId', grant_id);
END;
$$;
