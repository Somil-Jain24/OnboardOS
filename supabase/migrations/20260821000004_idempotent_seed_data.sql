-- Migration 04: Idempotent Seed Data for Demo & Production Workflows

DO $$
DECLARE
  v_org_id UUID := 'a0000000-0000-0000-0000-000000000001';
  v_rahul_id UUID := 'f0000000-0000-0000-0000-000000000001';
  v_priya_id UUID := 'f0000000-0000-0000-0000-000000000002';
  v_aman_id UUID := 'f0000000-0000-0000-0000-000000000003';
  
  -- Users from existing seed
  v_sarah_usr UUID := '10000000-0000-0000-0000-000000000001';
  v_marcus_usr UUID := '10000000-0000-0000-0000-000000000002';
  v_rahul_usr UUID := '10000000-0000-0000-0000-000000000003';
  v_david_usr UUID := '10000000-0000-0000-0000-000000000004';
  v_elena_usr UUID := '10000000-0000-0000-0000-000000000005';

  v_ctx_id UUID := '20000000-0000-0000-0000-000000000001';
  v_plan_id UUID := '20000000-0000-0000-0000-000000000002';
  
  v_pi_google UUID := '31000000-0000-0000-0000-000000000001';
  v_pi_slack UUID := '31000000-0000-0000-0000-000000000002';
  v_pi_github UUID := '31000000-0000-0000-0000-000000000003';
  v_pi_jira UUID := '31000000-0000-0000-0000-000000000004';
  v_pi_aws UUID := '31000000-0000-0000-0000-000000000005';

  v_task_google UUID := '40000000-0000-0000-0000-000000000001';
  v_task_slack UUID := '40000000-0000-0000-0000-000000000002';
  v_task_github UUID := '40000000-0000-0000-0000-000000000003';
  v_task_jira UUID := '40000000-0000-0000-0000-000000000004';
  v_task_board UUID := '40000000-0000-0000-0000-000000000005';
  v_task_aws UUID := '40000000-0000-0000-0000-000000000006';

  v_appr_aws UUID := '50000000-0000-0000-0000-000000000001';
  v_ex_jira UUID := '60000000-0000-0000-0000-000000000001';
  v_risk_rahul UUID := '70000000-0000-0000-0000-000000000001';

  v_ent_gw UUID := '80000000-0000-0000-0000-000000000001';
  v_ent_slack UUID := '80000000-0000-0000-0000-000000000002';
  v_ent_gh UUID := '80000000-0000-0000-0000-000000000003';
  v_ent_jira UUID := '80000000-0000-0000-0000-000000000004';
  v_ent_aws UUID := '80000000-0000-0000-0000-000000000005';

  v_pkg_dev UUID := '90000000-0000-0000-0000-000000000001';
  v_pkg_fin UUID := '90000000-0000-0000-0000-000000000002';
  
  v_req_1 UUID := 'a1000000-0000-0000-0000-000000000001';
  v_grant_1 UUID := 'b1000000-0000-0000-0000-000000000001';
  v_policy_br UUID := 'c1000000-0000-0000-0000-000000000001';

BEGIN
  -- 1. Ensure Organization
  INSERT INTO public.organizations (id, name, domain)
  VALUES (v_org_id, 'OnboardOS Enterprise', 'onboardos.internal')
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  -- 2. Update Users with full names
  UPDATE public.users SET name = 'Sarah Chen' WHERE id = v_sarah_usr;
  UPDATE public.users SET name = 'Marcus Vance' WHERE id = v_marcus_usr;
  UPDATE public.users SET name = 'Rahul Sharma' WHERE id = v_rahul_usr;
  UPDATE public.users SET name = 'David Kim' WHERE id = v_david_usr;
  UPDATE public.users SET name = 'Elena Rostova' WHERE id = v_elena_usr;

  -- 3. Entitlements Catalog
  INSERT INTO public.entitlements (id, org_id, app_name, permission_name, resource_type, risk_level)
  VALUES 
    (v_ent_gw, v_org_id, 'Google Workspace', 'Mailbox & Drive User', 'APPLICATION', 'LOW'),
    (v_ent_slack, v_org_id, 'Slack Enterprise', 'Member (#engineering, #payments)', 'COMMUNICATION', 'LOW'),
    (v_ent_gh, v_org_id, 'GitHub Enterprise', 'Repo Write / Contributor', 'REPOSITORY', 'LOW'),
    (v_ent_jira, v_org_id, 'Jira Software', 'Payments Project Board User', 'PROJECT_BOARD', 'LOW'),
    (v_ent_aws, v_org_id, 'AWS IAM', 'Production Deployer Role', 'CLOUD_ROLE', 'HIGH')
  ON CONFLICT (id) DO UPDATE SET 
    app_name = EXCLUDED.app_name, 
    permission_name = EXCLUDED.permission_name, 
    resource_type = EXCLUDED.resource_type, 
    risk_level = EXCLUDED.risk_level;

  -- 4. Access Packages
  INSERT INTO public.access_packages (id, org_id, code, name, description, category, risk_level, owner_user_id, max_duration_days, review_frequency_days)
  VALUES 
    (v_pkg_dev, v_org_id, 'PKG-CORE-DEV', 'Core Developer Tool Suite', 'Standard bundle for all engineering software developers.', 'DEVELOPMENT', 'LOW', v_marcus_usr, 90, 90),
    (v_pkg_fin, v_org_id, 'PKG-PAY-PROD', 'Production Payments Infrastructure', 'High-privilege production database and gateway deployment access.', 'FINANCE', 'HIGH', v_elena_usr, 30, 30)
  ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    description = EXCLUDED.description,
    risk_level = EXCLUDED.risk_level;

  INSERT INTO public.access_package_entitlements (id, org_id, package_id, entitlement_id)
  VALUES
    (extensions.uuid_generate_v4(), v_org_id, v_pkg_dev, v_ent_gw),
    (extensions.uuid_generate_v4(), v_org_id, v_pkg_dev, v_ent_slack),
    (extensions.uuid_generate_v4(), v_org_id, v_pkg_dev, v_ent_gh),
    (extensions.uuid_generate_v4(), v_org_id, v_pkg_dev, v_ent_jira),
    (extensions.uuid_generate_v4(), v_org_id, v_pkg_fin, v_ent_aws)
  ON CONFLICT (package_id, entitlement_id) DO NOTHING;

  INSERT INTO public.access_package_approval_stages (id, org_id, package_id, stage, approver_role, sla_hours)
  VALUES
    (extensions.uuid_generate_v4(), v_org_id, v_pkg_dev, 1, 'MANAGER', 24),
    (extensions.uuid_generate_v4(), v_org_id, v_pkg_fin, 1, 'MANAGER', 12),
    (extensions.uuid_generate_v4(), v_org_id, v_pkg_fin, 2, 'SECURITY', 12)
  ON CONFLICT (package_id, stage) DO NOTHING;

  -- 5. Birthright Policy for Engineering Backend Developers
  INSERT INTO public.birthright_policies (id, org_id, name, description, policy_type, status, priority, version, author_user_id)
  VALUES (v_policy_br, v_org_id, 'Engineering Backend Developer Birthright', 'Auto-provisions base dev tools for engineering backend hires on Day 1.', 'BIRTHRIGHT', 'ACTIVE', 10, 1, v_elena_usr)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

  INSERT INTO public.policy_conditions (id, org_id, policy_id, field, operator, value)
  VALUES 
    (extensions.uuid_generate_v4(), v_org_id, v_policy_br, 'department', 'EQUALS', '"Engineering"'::jsonb),
    (extensions.uuid_generate_v4(), v_org_id, v_policy_br, 'employmentType', 'EQUALS', '"FULL_TIME"'::jsonb)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.policy_entitlements (id, org_id, policy_id, entitlement_id, decision, requires_approval)
  VALUES
    (extensions.uuid_generate_v4(), v_org_id, v_policy_br, v_ent_gw, 'REQUIRED', false),
    (extensions.uuid_generate_v4(), v_org_id, v_policy_br, v_ent_slack, 'REQUIRED', false),
    (extensions.uuid_generate_v4(), v_org_id, v_policy_br, v_ent_gh, 'REQUIRED', false),
    (extensions.uuid_generate_v4(), v_org_id, v_policy_br, v_ent_jira, 'REQUIRED', false),
    (extensions.uuid_generate_v4(), v_org_id, v_policy_br, v_ent_aws, 'APPROVAL_REQUIRED', true)
  ON CONFLICT (policy_id, entitlement_id) DO NOTHING;

  -- 6. Rahul Sharma Complete Workflow (Context, Plan, Plan Items, Tasks, Approvals, Exceptions)
  INSERT INTO public.employee_contexts (id, org_id, employee_id, captured_at, role_title, department, team, seniority, location, employment_type, raw_vector)
  VALUES (v_ctx_id, v_org_id, v_rahul_id, now(), 'Junior Backend Developer', 'Engineering', 'Payments Core', 'JUNIOR', 'Bengaluru, India (Hybrid)', 'FULL_TIME', '{"skills":["TypeScript","PostgreSQL","Docker"],"cohort":"September 2026"}'::jsonb)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.onboarding_plans (id, org_id, employee_id, employee_context_id, rule_set_version, generated_at, status, reasoning_sequence)
  VALUES (v_plan_id, v_org_id, v_rahul_id, v_ctx_id, 1, now(), 'ACTIVE', '[{"step":1,"title":"Context Normalization","description":"Extracted role Junior Backend Developer in Engineering","status":"completed"},{"step":2,"title":"Policy Resolution","description":"Applied 5 birthright rules and least-privilege overrides","status":"completed"},{"step":3,"title":"DAG Assembly","description":"Generated cycle-validated dependency graph","status":"completed"}]'::jsonb)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.plan_items (id, org_id, plan_id, name, category, final_decision, reason, ai_confidence, ai_rationale, risk_level)
  VALUES
    (v_pi_google, v_org_id, v_plan_id, 'Google Workspace Account', 'Identity', 'REQUIRED', 'Universal identity and mailbox requirement for all corporate staff.', 0.99, 'Standard corporate identity.', 'LOW'),
    (v_pi_slack, v_org_id, v_plan_id, 'Slack Channels (#engineering, #payments)', 'Communication', 'REQUIRED', 'Team communication channels.', 0.98, 'Department team channels.', 'LOW'),
    (v_pi_github, v_org_id, v_plan_id, 'GitHub Organization & Repo Access', 'Development', 'REQUIRED', 'Source code management rights.', 0.97, 'Daily engineering workflow.', 'LOW'),
    (v_pi_jira, v_org_id, v_plan_id, 'Jira Software Project Backlog', 'Project', 'REQUIRED', 'Agile sprint tracking and task ownership.', 0.96, 'Sprint backlog tracking.', 'LOW'),
    (v_pi_aws, v_org_id, v_plan_id, 'AWS Production Cloud Access', 'Cloud', 'APPROVAL_REQUIRED', 'Junior engineers require explicit manager authorization prior to cloud production deployment rights.', 0.91, 'Policy override for least privilege.', 'HIGH')
  ON CONFLICT (id) DO NOTHING;

  -- Tasks
  INSERT INTO public.tasks (id, org_id, plan_item_id, employee_id, name, category, status, adapter_type, attempt, idempotency_key, failure_code, failure_reason, created_at, started_at, completed_at)
  VALUES
    (v_task_google, v_org_id, v_pi_google, v_rahul_id, 'Create Google Workspace Mailbox & User', 'Identity', 'COMPLETED', 'GOOGLE', 1, 'idemp-rahul-google-1', NULL, NULL, now() - interval '2 hours', now() - interval '119 minutes', now() - interval '118 minutes'),
    (v_task_slack, v_org_id, v_pi_slack, v_rahul_id, 'Provision Slack User & Add to Channels', 'Communication', 'COMPLETED', 'SLACK', 1, 'idemp-rahul-slack-1', NULL, NULL, now() - interval '2 hours', now() - interval '117 minutes', now() - interval '116 minutes'),
    (v_task_github, v_org_id, v_pi_github, v_rahul_id, 'Invite to GitHub Org & Payments Repo', 'Development', 'COMPLETED', 'GITHUB', 1, 'idemp-rahul-github-1', NULL, NULL, now() - interval '2 hours', now() - interval '115 minutes', now() - interval '114 minutes'),
    (v_task_jira, v_org_id, v_pi_jira, v_rahul_id, 'Add to Jira Project & Payments Board', 'Project', 'FAILED', 'JIRA', 1, 'idemp-rahul-jira-1', 'JIRA_API_RATE_LIMIT', 'Rate limit exceeded on Jira Service Management API (HTTP 503).', now() - interval '2 hours', now() - interval '113 minutes', NULL),
    (v_task_board, v_org_id, NULL, v_rahul_id, 'Payments Jira Board Sprint Assignment', 'Project', 'BLOCKED', 'JIRA', 0, NULL, NULL, 'Blocked by upstream Jira provisioning failure.', now() - interval '2 hours', NULL, NULL),
    (v_task_aws, v_org_id, v_pi_aws, v_rahul_id, 'AWS Production Cloud Access Grant', 'Cloud', 'WAITING_APPROVAL', 'AWS', 0, NULL, NULL, 'Awaiting Marcus Vance (Engineering Manager) signoff.', now() - interval '2 hours', NULL, NULL)
  ON CONFLICT (id) DO NOTHING;

  -- Task Dependencies (Google -> GitHub, Google -> Slack, Google -> Jira, Jira -> Board, Google -> AWS)
  INSERT INTO public.task_dependencies (id, org_id, task_id, depends_on_task_id)
  VALUES
    (extensions.uuid_generate_v4(), v_org_id, v_task_github, v_task_google),
    (extensions.uuid_generate_v4(), v_org_id, v_task_slack, v_task_google),
    (extensions.uuid_generate_v4(), v_org_id, v_task_jira, v_task_google),
    (extensions.uuid_generate_v4(), v_org_id, v_task_board, v_task_jira),
    (extensions.uuid_generate_v4(), v_org_id, v_task_aws, v_task_google)
  ON CONFLICT (task_id, depends_on_task_id) DO NOTHING;

  -- Pending Approval for AWS
  INSERT INTO public.approvals (id, org_id, task_id, employee_id, stage, approver_role, approver_user_id, status, requested_at, sla_target_at, reason)
  VALUES (v_appr_aws, v_org_id, v_task_aws, v_rahul_id, 1, 'MANAGER', v_marcus_usr, 'PENDING', now() - interval '2 hours', now() + interval '2 hours', 'Junior Backend Developer requesting AWS production access. Manager signoff required.')
  ON CONFLICT (id) DO NOTHING;

  -- Exception Event for Jira Failure
  INSERT INTO public.exception_events (id, org_id, employee_id, task_id, severity, title, description, impact_summary, created_at)
  VALUES (v_ex_jira, v_org_id, v_rahul_id, v_task_jira, 'CRITICAL', 'Jira Provisioning HTTP 503 Failure', 'Jira Adapter encountered rate limit error during user project assignment.', 'Blocks 2 downstream tasks on Payments sprint board.', now() - interval '113 minutes')
  ON CONFLICT (id) DO NOTHING;

  -- Risk Assessment & Readiness Result
  INSERT INTO public.risk_assessments (id, org_id, employee_id, computed_at, risk_score, risk_level, day_one_ready, factors, readiness_breakdown)
  VALUES (
    v_risk_rahul, 
    v_org_id, 
    v_rahul_id, 
    now(), 
    75, 
    'HIGH', 
    false, 
    '[{"factor":"Active Provisioning Failure","weight":40,"detail":"Jira failure is currently halting downstream project backlog assignment.","severity":"HIGH"},{"factor":"Pending Production Privilege Approval","weight":35,"detail":"AWS production grant awaiting manager signoff.","severity":"HIGH"}]'::jsonb,
    '{"criticalTasksTotal":6,"criticalTasksComplete":3,"requiredAccessTotal":5,"requiredAccessComplete":3,"requiredTrainingTotal":1,"requiredTrainingComplete":0,"blockingFailures":1,"pendingApprovals":1}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;

  -- 7. Notifications
  INSERT INTO public.notifications (id, org_id, user_id, priority, title, body, read_at, ref_type, ref_id)
  VALUES
    (extensions.uuid_generate_v4(), v_org_id, v_sarah_usr, 'CRITICAL', 'Jira Provisioning Failed for Rahul Sharma', 'Rate limit error (HTTP 503). 2 downstream tasks are BLOCKED.', NULL, 'Task', v_task_jira),
    (extensions.uuid_generate_v4(), v_org_id, v_marcus_usr, 'HIGH', 'Manager Approval Required: AWS Production Access', 'Rahul Sharma (Junior Backend Developer) requested AWS access. SLA: 2 hours remaining.', NULL, 'Approval', v_appr_aws),
    (extensions.uuid_generate_v4(), v_org_id, v_rahul_usr, 'MEDIUM', 'Welcome to OnboardOS! Setup In Progress', 'Your developer workspace is being provisioned. Google, Slack, and GitHub are ready.', NULL, 'Employee', v_rahul_id)
  ON CONFLICT (id) DO NOTHING;

  -- 8. Assets & IT Ticket
  INSERT INTO public.assets (id, org_id, employee_id, asset_type, asset_tag, model, serial_number, state, assigned_at)
  VALUES
    (extensions.uuid_generate_v4(), v_org_id, v_rahul_id, 'LAPTOP', 'AST-MBP-091', 'MacBook Pro 16" M3 Max (36GB/1TB)', 'C02G894LMD6R', 'ASSIGNED', now() - interval '3 days'),
    (extensions.uuid_generate_v4(), v_org_id, v_priya_id, 'MONITOR', 'AST-MON-092', 'Dell UltraSharp 27" 4K Monitor', 'CN-0K7938-74261', 'RECEIVED', now() - interval '2 days')
  ON CONFLICT (asset_tag) DO NOTHING;

  INSERT INTO public.tickets (id, org_id, employee_id, created_by_user_id, subject, category, priority, assigned_team, status, description, ai_classification)
  VALUES (
    extensions.uuid_generate_v4(), 
    v_org_id, 
    v_rahul_id, 
    v_sarah_usr, 
    'Jira Access Rate Limit Error Resolution', 
    'Provisioning', 
    'HIGH', 
    'IT Operations', 
    'OPEN', 
    'Jira board access returning HTTP 503 due to adapter rate limit on Payments pod backlog.', 
    '{"suggestedCategory":"Access & Provisioning","suggestedPriority":"HIGH","confidence":0.97,"recommendedActions":["Run Jira Adapter Idempotent Retry","Check API Token Quota"]}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;

  -- 9. Active Access Grant & Access Request
  INSERT INTO public.access_grants (id, org_id, employee_id, entitlement_id, package_id, source_type, granted_by_user_id, granted_at, expires_at, status)
  VALUES (
    v_grant_1,
    v_org_id,
    v_rahul_id,
    v_ent_gh,
    v_pkg_dev,
    'BIRTHRIGHT_POLICY',
    v_elena_usr,
    now() - interval '1 day',
    now() + interval '89 days',
    'ACTIVE'
  )
  ON CONFLICT (employee_id, entitlement_id) WHERE status = 'ACTIVE' DO NOTHING;

  INSERT INTO public.access_requests (id, org_id, package_id, requester_employee_id, justification, duration_days, status, current_stage)
  VALUES (
    v_req_1,
    v_org_id,
    v_pkg_fin,
    v_rahul_id,
    'Need temporary read-only production telemetry access to verify payment gateway webhook retry latencies.',
    14,
    'PENDING',
    1
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.access_request_approvals (id, org_id, access_request_id, stage, approver_role, approver_user_id, status)
  VALUES
    (extensions.uuid_generate_v4(), v_org_id, v_req_1, 1, 'MANAGER', v_marcus_usr, 'PENDING'),
    (extensions.uuid_generate_v4(), v_org_id, v_req_1, 2, 'SECURITY', v_david_usr, 'PENDING')
  ON CONFLICT (access_request_id, stage) DO NOTHING;

  -- 10. SoD Conflicts
  INSERT INTO public.sod_conflicts (id, org_id, sod_rule_id, employee_id, existing_grant_id, requested_entitlement_id, status, compensating_control_note, approved_by_user_id)
  VALUES
    (
      extensions.uuid_generate_v4(),
      v_org_id,
      '30000000-0000-0000-0000-000000000001',
      v_rahul_id,
      v_grant_1,
      v_ent_aws,
      'ACTIVE_VIOLATION',
      'Requires dual-signoff and mandatory on-call logging during deployment sessions.',
      v_elena_usr
    )
  ON CONFLICT DO NOTHING;

  -- 11. Mentor & First Week Plan
  INSERT INTO public.mentor_assignments (id, org_id, employee_id, mentor_name, mentor_role, mentor_email, mentor_slack, buddy_name, buddy_role, buddy_email, buddy_slack, scheduled_syncs)
  VALUES (
    extensions.uuid_generate_v4(),
    v_org_id,
    v_rahul_id,
    'Kavita Rao',
    'Staff Backend Engineer',
    'kavita.rao@onboardos.internal',
    '@kavita.rao',
    'Alex Rivera',
    'Product Designer',
    'alex.rivera@onboardos.internal',
    '@alex.rivera',
    '[{"date":"2026-09-01","time":"11:00 AM","topic":"Welcome & Codebase Tour","status":"SCHEDULED"},{"date":"2026-09-02","time":"03:00 PM","topic":"Architecture & CI/CD Walkthrough","status":"SCHEDULED"}]'::jsonb
  )
  ON CONFLICT DO NOTHING;

  INSERT INTO public.first_week_plan_items (id, org_id, employee_id, day, time_slot, title, description, category, completed)
  VALUES
    (extensions.uuid_generate_v4(), v_org_id, v_rahul_id, 1, '09:30 AM', 'Hardware Unboxing & Security Keys', 'Configure YubiKey and corporate password manager.', 'SETUP', true),
    (extensions.uuid_generate_v4(), v_org_id, v_rahul_id, 1, '11:00 AM', 'Welcome 1:1 with Marcus Vance', 'Overview of Q3 Payments Pod goals and engineering standards.', 'MEETING', false),
    (extensions.uuid_generate_v4(), v_org_id, v_rahul_id, 2, '10:00 AM', 'Payments Microservices Deep Dive', 'Architecture walkthrough with Kavita Rao.', 'TRAINING', false),
    (extensions.uuid_generate_v4(), v_org_id, v_rahul_id, 3, '02:00 PM', 'Submit First Pull Request', 'Fix Good First Issue in payments-backend repo.', 'SETUP', false)
  ON CONFLICT DO NOTHING;

  -- 12. Community Posts & Pulse Responses
  INSERT INTO public.community_posts (id, org_id, author_user_id, type, title, body, likes_count, comments_count)
  VALUES
    (extensions.uuid_generate_v4(), v_org_id, v_sarah_usr, 'ANNOUNCEMENT', 'Welcome our Q3 New Hires!', 'Please join us in welcoming Rahul Sharma (Engineering), Priya Mehta (Design), and Aman Verma (HR) to the OnboardOS team! 🎉', 14, 3)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.pulse_responses (id, org_id, employee_id, value, note, submitted_at)
  VALUES
    (extensions.uuid_generate_v4(), v_org_id, v_rahul_id, 'GREAT', 'Onboarding setup was super fast and clear!', now() - interval '1 day'),
    (extensions.uuid_generate_v4(), v_org_id, v_priya_id, 'GOOD', 'Got all design tools quickly.', now() - interval '2 days'),
    (extensions.uuid_generate_v4(), v_org_id, v_aman_id, 'GREAT', 'Excited to start!', now() - interval '3 days')
  ON CONFLICT DO NOTHING;

  -- 13. Knowledge Documents
  INSERT INTO public.knowledge_documents (id, org_id, title, category, source, content)
  VALUES
    (extensions.uuid_generate_v4(), v_org_id, 'Engineering Security & Cloud Deployment Policy', 'Security', 'Internal Wiki: /security/cloud-policy', 'All production cloud resources require least-privilege role assignment. Junior engineers require Engineering Manager authorization before cloud IAM grants are activated.'),
    (extensions.uuid_generate_v4(), v_org_id, 'Payments Core Service Architecture & SLA Guide', 'Architecture', 'Internal Wiki: /engineering/payments-v2', 'The Payments Core service handles credit card settlement and webhook verification. Developers require GitHub repository access and Jira Payments backlog assignment.')
  ON CONFLICT DO NOTHING;

  -- 14. Identity Sources, SCIM Connectors, SaaS Licenses
  INSERT INTO public.identity_sources (id, org_id, name, type, is_authoritative, last_sync_at, account_count, status)
  VALUES
    (extensions.uuid_generate_v4(), v_org_id, 'Workday HRMS', 'HRMS', true, now() - interval '15 minutes', 1248, 'HEALTHY'),
    (extensions.uuid_generate_v4(), v_org_id, 'Okta Universal Directory', 'IDP', false, now() - interval '5 minutes', 1245, 'HEALTHY')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.scim_connectors (id, org_id, app_name, endpoint_url, scim_version, auth_type, status, sync_success_rate, total_synced_users)
  VALUES
    (extensions.uuid_generate_v4(), v_org_id, 'Slack Enterprise Grid', 'https://api.slack.com/scim/v2', 'SCIM 2.0', 'BEARER_TOKEN', 'ONLINE', 99.80, 1240),
    (extensions.uuid_generate_v4(), v_org_id, 'GitHub Enterprise Cloud', 'https://api.github.com/scim/v2/organizations/onboardos', 'SCIM 2.0', 'BEARER_TOKEN', 'ONLINE', 100.00, 480)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.saas_licenses (id, org_id, app_name, tier, total_seats, assigned_seats, inactive_seats_30d, cost_per_seat_monthly, status)
  VALUES
    (extensions.uuid_generate_v4(), v_org_id, 'GitHub Enterprise', 'Enterprise Cloud', 500, 480, 18, 21.00, 'RECLAIM_RECOMMENDED'),
    (extensions.uuid_generate_v4(), v_org_id, 'Figma Enterprise', 'Organization', 100, 95, 8, 45.00, 'RECLAIM_RECOMMENDED'),
    (extensions.uuid_generate_v4(), v_org_id, 'Slack Enterprise Grid', 'Enterprise Grid', 1500, 1240, 45, 15.00, 'OPTIMAL')
  ON CONFLICT DO NOTHING;

END $$;
