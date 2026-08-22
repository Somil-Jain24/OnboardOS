import { supabase } from '../../lib/supabase';
import type { OnboardOSClient, CreateEmployeeInput } from '../types';
import { mockClient } from '../mock/mockClient';
import type {
  Employee,
  EmployeeContext,
  RequirementRule,
  OnboardingPlan,
  PlanItem,
  Task,
  Approval,
  ExceptionEvent,
  RiskAssessment,
  AuditLog,
  Ticket,
  Asset,
  KnowledgeDocument,
  KnowledgeAnswer,
  NotificationItem,
  WhatIfSimulationInput,
  WhatIfSimulationDiff,
  TransferRequest,
  OffboardingPlan,
  OffboardingRiskFlag,
  MentorAssignment,
  FirstWeekPlanItem,
  PulseResponse,
  PulseTrendData,
  CommunityPost,
  RequirementDecision,
  ApprovalStatus,
  BirthrightPolicy,
  AccessPackage,
  AccessRequest,
  AccessGrant,
  AccessReviewCampaign,
  AccessReviewItem,
  SoDRule,
  SoDConflict,
  ElevationSession,
  IdentitySource,
  ReconciliationMismatch,
  SCIMConnector,
  ExternalIdentity,
  ComplianceEvidenceItem,
  StaleAccessItem,
  DevicePostureSignal,
  SaaSLicense,
  AgentIdentity,
  DelegatedAdminScope,
  GovernanceAnalyticsData,
  PolicyEvaluationResult,
} from '../../types';

export class SupabaseService implements OnboardOSClient {
  private fallback = mockClient;

  // --- Employees ---
  async getEmployees(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id, name, email, seniority, location, employment_type, status, start_date, created_at, updated_at,
          department_id, departments ( name ),
          team_id, teams ( name ),
          role_id, roles ( title )
        `)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return this.fallback.getEmployees();

      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        email: d.email,
        roleId: d.role_id || '',
        roleTitle: d.roles?.title || 'Engineer',
        departmentId: d.department_id || '',
        departmentName: d.departments?.name || 'Engineering',
        teamId: d.team_id || '',
        teamName: d.teams?.name || 'Core Pod',
        seniority: d.seniority,
        location: d.location || 'Bengaluru, India',
        employmentType: d.employment_type || 'FULL_TIME',
        status: d.status,
        startDate: d.start_date || new Date().toISOString(),
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
    } catch {
      return this.fallback.getEmployees();
    }
  }

  async getEmployee(id: string): Promise<Employee | null> {
    const list = await this.getEmployees();
    return list.find((e) => e.id === id) || null;
  }

  async createEmployee(input: CreateEmployeeInput): Promise<Employee> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert({
          name: input.name,
          email: input.email,
          seniority: input.seniority,
          location: input.location,
          employment_type: input.employmentType,
          status: 'INVITED',
          start_date: input.startDate || new Date().toISOString(),
        })
        .select()
        .single();

      if (error || !data) {
        return this.fallback.createEmployee(input);
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        roleId: data.role_id || '',
        roleTitle: input.roleTitle,
        departmentId: data.department_id || '',
        departmentName: input.department,
        teamId: data.team_id || '',
        teamName: input.team,
        seniority: data.seniority,
        location: data.location,
        employmentType: data.employment_type,
        status: data.status,
        startDate: data.start_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch {
      return this.fallback.createEmployee(input);
    }
  }

  async getEmployeeContext(employeeId: string): Promise<EmployeeContext | null> {
    try {
      const { data, error } = await supabase
        .from('employee_contexts')
        .select('*')
        .eq('employee_id', employeeId)
        .order('captured_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return this.fallback.getEmployeeContext(employeeId);

      return {
        id: data.id,
        employeeId: data.employee_id,
        capturedAt: data.captured_at,
        roleTitle: data.role_title,
        department: data.department,
        team: data.team,
        seniority: data.seniority,
        location: data.location,
        employmentType: data.employment_type,
        raw: data.raw_vector || {},
      };
    } catch {
      return this.fallback.getEmployeeContext(employeeId);
    }
  }

  // --- Policies & Rules ---
  async getRules(): Promise<RequirementRule[]> {
    return this.fallback.getRules();
  }

  async getRulesByScope(department: string, role: string): Promise<RequirementRule[]> {
    return this.fallback.getRulesByScope(department, role);
  }

  // --- Plans & AI Reasoning ---
  async generatePlan(employeeId: string): Promise<OnboardingPlan> {
    return this.fallback.generatePlan(employeeId);
  }

  async getPlan(employeeId: string): Promise<OnboardingPlan | null> {
    try {
      const { data: planData, error: planError } = await supabase
        .from('onboarding_plans')
        .select('*, plan_items(*)')
        .eq('employee_id', employeeId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planError || !planData) return this.fallback.getPlan(employeeId);

      return {
        id: planData.id,
        employeeId: planData.employee_id,
        employeeContextId: planData.employee_context_id,
        ruleSetVersion: planData.rule_set_version,
        generatedAt: planData.generated_at,
        status: planData.status,
        items: (planData.plan_items || []).map((pi: any) => ({
          id: pi.id,
          planId: pi.plan_id,
          name: pi.name,
          category: pi.category,
          finalDecision: pi.final_decision,
          reason: pi.reason,
          aiRecommendedDecision: pi.final_decision,
          aiConfidence: pi.ai_confidence,
          aiRationale: pi.ai_rationale,
          riskLevel: pi.risk_level,
        })),
      };
    } catch {
      return this.fallback.getPlan(employeeId);
    }
  }

  async updatePlanItemDecision(itemId: string, decision: RequirementDecision, reason: string): Promise<PlanItem> {
    return this.fallback.updatePlanItemDecision(itemId, decision, reason);
  }

  // --- Tasks & Execution DAG ---
  async getTasks(employeeId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) return this.fallback.getTasks(employeeId);

      return data.map((t: any) => ({
        id: t.id,
        employeeId: t.employee_id,
        planItemId: t.plan_item_id,
        name: t.name,
        category: t.category,
        status: t.status,
        adapterType: t.adapter_type,
        attempt: t.attempt,
        idempotencyKey: t.idempotency_key,
        failureCode: t.failure_code,
        failureReason: t.failure_reason,
        createdAt: t.created_at,
        startedAt: t.started_at,
        completedAt: t.completed_at,
      }));
    } catch {
      return this.fallback.getTasks(employeeId);
    }
  }

  async retryTask(taskId: string): Promise<{ task: Task; unblockedTasks: Task[] }> {
    return this.fallback.retryTask(taskId);
  }

  async claimTask(taskId: string): Promise<{ task: Task; credentials: any }> {
    return this.fallback.claimTask(taskId);
  }

  async claimAccess(taskId: string): Promise<{ success: boolean; task: Task; claimStatus: string; automationStatus?: string }> {
    return this.fallback.claimAccess(taskId);
  }

  async validateActivationToken(token: string): Promise<{ valid: boolean; employee?: Partial<Employee>; expiresAt?: string; error?: string }> {
    return this.fallback.validateActivationToken(token);
  }

  async activateAccount(token: string, password: string): Promise<{ success: boolean; user?: any; token?: string; error?: string }> {
    return this.fallback.activateAccount(token, password);
  }

  async resendActivation(employeeId: string): Promise<{ success: boolean; message: string; invitation?: any }> {
    return this.fallback.resendActivation(employeeId);
  }

  async skipTask(taskId: string, reason: string): Promise<Task> {
    return this.fallback.skipTask(taskId, reason);
  }

  async manualOverrideTask(taskId: string, reason: string): Promise<{ task: Task; unblockedTasks: Task[] }> {
    return this.fallback.manualOverrideTask(taskId, reason);
  }

  // --- Approvals ---
  async getApprovals(role?: 'MANAGER' | 'SECURITY' | 'ADMIN'): Promise<Approval[]> {
    try {
      let query = supabase.from('approvals').select('*, tasks(name), employees(name)');
      if (role && role !== 'ADMIN') {
        query = query.eq('approver_role', role);
      }
      const { data, error } = await query.order('requested_at', { ascending: false });

      if (error || !data || data.length === 0) return this.fallback.getApprovals(role);

      return data.map((a: any) => ({
        id: a.id,
        taskId: a.task_id,
        taskName: a.tasks?.name || 'Task Approval',
        employeeId: a.employee_id,
        employeeName: a.employees?.name || 'Employee',
        stage: a.stage,
        approverRole: a.approver_role,
        approverUserId: a.approver_user_id,
        status: a.status,
        riskLevel: 'HIGH',
        requestedAt: a.requested_at,
        respondedAt: a.responded_at,
        slaTargetAt: a.sla_target_at,
        reason: a.reason,
        responseNote: a.response_note,
      }));
    } catch {
      return this.fallback.getApprovals(role);
    }
  }

  async respondApproval(
    approvalId: string,
    status: ApprovalStatus,
    note?: string
  ): Promise<{ approval: Approval; unblockedTask?: Task }> {
    try {
      await supabase
        .from('approvals')
        .update({ status, responded_at: new Date().toISOString(), response_note: note })
        .eq('id', approvalId);
    } catch {
      // ignore
    }
    return this.fallback.respondApproval(approvalId, status, note);
  }

  // --- Risk & Readiness ---
  async getRiskAssessment(employeeId: string): Promise<RiskAssessment> {
    try {
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('employee_id', employeeId)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return this.fallback.getRiskAssessment(employeeId);

      return {
        id: data.id,
        employeeId: data.employee_id,
        computedAt: data.computed_at,
        riskScore: data.risk_score,
        riskLevel: data.risk_level,
        factors: data.factors || [],
        dayOneReady: data.day_one_ready,
        readinessScore: 100 - data.risk_score,
        readinessBreakdown: data.readiness_breakdown || {},
      };
    } catch {
      return this.fallback.getRiskAssessment(employeeId);
    }
  }

  // --- What-If Simulation ---
  async simulateWhatIf(employeeId: string, input: WhatIfSimulationInput): Promise<WhatIfSimulationDiff> {
    return this.fallback.simulateWhatIf(employeeId, input);
  }

  // --- Exceptions & Failures ---
  async getExceptions(): Promise<ExceptionEvent[]> {
    try {
      const { data, error } = await supabase
        .from('exception_events')
        .select('*, employees(name), tasks(name)')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return this.fallback.getExceptions();

      return data.map((ex: any) => ({
        id: ex.id,
        employeeId: ex.employee_id,
        employeeName: ex.employees?.name || 'Employee',
        taskId: ex.task_id,
        taskName: ex.tasks?.name,
        approvalId: ex.approval_id,
        severity: ex.severity,
        title: ex.title,
        description: ex.description,
        impactSummary: ex.impact_summary,
        createdAt: ex.created_at,
        resolvedAt: ex.resolved_at,
        resolvedBy: ex.resolved_by,
      }));
    } catch {
      return this.fallback.getExceptions();
    }
  }

  async resolveException(exceptionId: string, note?: string): Promise<ExceptionEvent> {
    try {
      await supabase
        .from('exception_events')
        .update({ severity: 'RESOLVED', resolved_at: new Date().toISOString() })
        .eq('id', exceptionId);
    } catch {
      // ignore
    }
    return this.fallback.resolveException(exceptionId, note);
  }

  // --- Audit Logs ---
  async getAuditLogs(employeeId?: string): Promise<AuditLog[]> {
    try {
      let query = supabase.from('audit_logs').select('*');
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      const { data, error } = await query.order('created_at', { ascending: false }).limit(50);

      if (error || !data || data.length === 0) return this.fallback.getAuditLogs(employeeId);

      return data.map((a: any) => ({
        id: a.id,
        employeeId: a.employee_id,
        actorUserId: a.actor_user_id,
        actorName: 'System User',
        actorRole: (a.actor_role as any) || 'ADMIN',
        action: a.action,
        entityType: a.entity_type,
        entityId: a.entity_id,
        previousState: a.previous_state,
        newState: a.new_state,
        reason: a.reason,
        result: a.result,
        createdAt: a.created_at,
      }));
    } catch {
      return this.fallback.getAuditLogs(employeeId);
    }
  }

  // --- P1 Intelligence ---
  async getTickets(employeeId?: string): Promise<Ticket[]> {
    try {
      let query = supabase.from('tickets').select('*, employees(name)');
      if (employeeId) query = query.eq('employee_id', employeeId);
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return this.fallback.getTickets(employeeId);

      return data.map((t: any) => ({
        id: t.id,
        employeeId: t.employee_id,
        employeeName: t.employees?.name || 'Employee',
        category: t.category,
        priority: t.priority,
        team: t.assigned_team || 'IT',
        slaHours: 24,
        status: t.status,
        description: t.description,
        aiClassification: t.ai_classification,
        createdAt: t.created_at,
        resolvedAt: t.resolved_at,
      }));
    } catch {
      return this.fallback.getTickets(employeeId);
    }
  }

  async createTicket(input: { employeeId: string; subject: string; category: string; description: string }): Promise<Ticket> {
    return this.fallback.createTicket(input);
  }

  async resolveTicket(ticketId: string, resolutionNote: string): Promise<Ticket> {
    return this.fallback.resolveTicket(ticketId, resolutionNote);
  }

  async reassignTicket(ticketId: string, team: string): Promise<Ticket> {
    return this.fallback.reassignTicket(ticketId, team);
  }

  async getAssets(employeeId?: string): Promise<Asset[]> {
    try {
      let query = supabase.from('assets').select('*, employees(name)');
      if (employeeId) query = query.eq('employee_id', employeeId);
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return this.fallback.getAssets(employeeId);

      return data.map((a: any) => ({
        id: a.id,
        employeeId: a.employee_id || '',
        employeeName: a.employees?.name || 'Unassigned',
        type: a.asset_type,
        serialNumber: a.serial_number || a.asset_tag,
        model: a.model || 'Standard Asset',
        state: a.state,
        assignedAt: a.assigned_at || a.created_at,
        returnedAt: a.returned_at,
      }));
    } catch {
      return this.fallback.getAssets(employeeId);
    }
  }

  async assignAsset(input: { employeeId: string; employeeName: string; type: 'LAPTOP' | 'MONITOR' | 'KEYBOARD' | 'MOUSE' | 'ID_CARD' | 'ACCESS_CARD'; model: string; serialNumber: string }): Promise<Asset> {
    return this.fallback.assignAsset(input);
  }

  async updateAssetState(assetId: string, state: 'ASSIGNED' | 'RECEIVED' | 'DAMAGED' | 'LOST' | 'RETURNED'): Promise<Asset> {
    return this.fallback.updateAssetState(assetId, state);
  }

  async getKnowledgeDocs(): Promise<KnowledgeDocument[]> {
    try {
      const { data, error } = await supabase.from('knowledge_documents').select('*');
      if (error || !data || data.length === 0) return this.fallback.getKnowledgeDocs();
      return data.map((d: any) => ({
        id: d.id,
        title: d.title,
        category: d.category,
        source: d.source,
        content: d.content,
        updatedAt: d.updated_at || d.created_at,
      }));
    } catch {
      return this.fallback.getKnowledgeDocs();
    }
  }

  async searchKnowledge(query: string): Promise<KnowledgeAnswer> {
    return this.fallback.searchKnowledge(query);
  }

  async getNotifications(userId: string): Promise<NotificationItem[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error || !data || data.length === 0) return this.fallback.getNotifications(userId);

      return data.map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        priority: n.priority,
        title: n.title,
        body: n.body,
        read: !!n.read_at,
        createdAt: n.created_at,
        refType: n.ref_type,
        refId: n.ref_id,
      }));
    } catch {
      return this.fallback.getNotifications(userId);
    }
  }

  async markNotificationAsRead(id: string): Promise<NotificationItem> {
    return this.fallback.markNotificationAsRead(id);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    return this.fallback.markAllNotificationsAsRead();
  }

  // --- P2 Lifecycle & Platform Extensions ---
  async getTransferRequests(): Promise<TransferRequest[]> {
    return this.fallback.getTransferRequests();
  }

  async createTransferRequest(employeeId: string, targetContext: Partial<EmployeeContext>): Promise<TransferRequest> {
    return this.fallback.createTransferRequest(employeeId, targetContext);
  }

  async applyTransfer(requestId: string): Promise<TransferRequest> {
    return this.fallback.applyTransfer(requestId);
  }

  async getOffboardingPlan(employeeId: string): Promise<OffboardingPlan | null> {
    return this.fallback.getOffboardingPlan(employeeId);
  }

  async createOffboardingPlan(employeeId: string): Promise<OffboardingPlan> {
    return this.fallback.createOffboardingPlan(employeeId);
  }

  async getOffboardingRisks(): Promise<OffboardingRiskFlag[]> {
    return this.fallback.getOffboardingRisks();
  }

  async resolveOffboardingRisk(flagId: string): Promise<OffboardingRiskFlag> {
    return this.fallback.resolveOffboardingRisk(flagId);
  }

  async getMentorAssignment(employeeId: string): Promise<MentorAssignment | null> {
    try {
      const { data, error } = await supabase
        .from('mentor_assignments')
        .select('*, employees(name)')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (error || !data) return this.fallback.getMentorAssignment(employeeId);

      return {
        id: data.id,
        employeeId: data.employee_id,
        employeeName: data.employees?.name || 'Rahul Sharma',
        mentorName: data.mentor_name,
        mentorRole: data.mentor_role,
        mentorEmail: data.mentor_email,
        mentorSlack: data.mentor_slack,
        buddyName: data.buddy_name || '',
        buddyRole: data.buddy_role || '',
        buddyEmail: data.buddy_email || '',
        buddySlack: data.buddy_slack || '',
        assignedAt: data.assigned_at,
        scheduledSyncs: data.scheduled_syncs || [],
      };
    } catch {
      return this.fallback.getMentorAssignment(employeeId);
    }
  }

  async getFirstWeekPlan(employeeId: string): Promise<FirstWeekPlanItem[]> {
    try {
      const { data, error } = await supabase
        .from('first_week_plan_items')
        .select('*')
        .eq('employee_id', employeeId)
        .order('day', { ascending: true });

      if (error || !data || data.length === 0) return this.fallback.getFirstWeekPlan(employeeId);

      return data.map((fw: any) => ({
        id: fw.id,
        employeeId: fw.employee_id,
        day: fw.day,
        time: fw.time_slot,
        title: fw.title,
        description: fw.description,
        category: fw.category,
        completed: fw.completed,
      }));
    } catch {
      return this.fallback.getFirstWeekPlan(employeeId);
    }
  }

  async submitPulse(employeeId: string, value: 'GREAT' | 'GOOD' | 'OKAY' | 'STRUGGLING', note?: string): Promise<PulseResponse> {
    try {
      const { data, error } = await supabase
        .from('pulse_responses')
        .insert({ employee_id: employeeId, value, note })
        .select()
        .single();

      if (error || !data) return this.fallback.submitPulse(employeeId, value, note);

      return {
        id: data.id,
        employeeId: data.employee_id,
        submittedAt: data.submitted_at,
        value: data.value,
        note: data.note,
      };
    } catch {
      return this.fallback.submitPulse(employeeId, value, note);
    }
  }

  async getPulseTrends(): Promise<PulseTrendData[]> {
    try {
      const { data, error } = await supabase.from('pulse_trends').select('*');
      if (error || !data || data.length === 0) return this.fallback.getPulseTrends();

      return data.map((pt: any) => ({
        week: pt.week_label,
        greatPercent: Number(pt.great_percent) || 0,
        goodPercent: Number(pt.good_percent) || 0,
        okayPercent: Number(pt.okay_percent) || 0,
        strugglingPercent: Number(pt.struggling_percent) || 0,
        totalResponses: Number(pt.total_responses) || 0,
      }));
    } catch {
      return this.fallback.getPulseTrends();
    }
  }

  async getCommunityPosts(): Promise<CommunityPost[]> {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*, users(name, role, avatar_url)')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return this.fallback.getCommunityPosts();

      return data.map((cp: any) => ({
        id: cp.id,
        authorName: cp.users?.name || 'Sarah Chen',
        authorRole: cp.users?.role || 'HR Director',
        authorAvatar: cp.users?.avatar_url,
        type: cp.type,
        title: cp.title,
        body: cp.body,
        createdAt: cp.created_at,
        likesCount: cp.likes_count,
        commentsCount: cp.comments_count,
      }));
    } catch {
      return this.fallback.getCommunityPosts();
    }
  }

  async createCommunityPost(post: { title: string; body: string; type: 'ANNOUNCEMENT' | 'EVENT' | 'UPDATE' | 'POLL' | 'KNOWLEDGE' }): Promise<CommunityPost> {
    return this.fallback.createCommunityPost(post);
  }

  async resetDemoState(): Promise<void> {
    return this.fallback.resetDemoState();
  }

  async injectJiraFailure(employeeId?: string): Promise<void> {
    return this.fallback.injectJiraFailure(employeeId);
  }

  // --- Enterprise Identity Methods ---
  async getBirthrightPolicies(): Promise<BirthrightPolicy[]> {
    return this.fallback.getBirthrightPolicies();
  }

  async createBirthrightPolicy(policy: Omit<BirthrightPolicy, 'id' | 'version' | 'updatedAt'>): Promise<BirthrightPolicy> {
    return this.fallback.createBirthrightPolicy(policy);
  }

  async updateBirthrightPolicy(id: string, updates: Partial<BirthrightPolicy>): Promise<BirthrightPolicy> {
    return this.fallback.updateBirthrightPolicy(id, updates);
  }

  async deleteBirthrightPolicy(id: string): Promise<boolean> {
    return this.fallback.deleteBirthrightPolicy(id);
  }

  async evaluateBirthrightAccess(context: Partial<EmployeeContext>): Promise<PolicyEvaluationResult> {
    return this.fallback.evaluateBirthrightAccess(context);
  }

  async getAccessPackages(): Promise<AccessPackage[]> {
    try {
      const { data, error } = await supabase.from('access_package_summary').select('*');
      if (error || !data || data.length === 0) return this.fallback.getAccessPackages();

      return data.map((p: any) => ({
        id: p.package_id,
        name: p.name,
        code: p.code,
        description: 'Package managed via Supabase governance ledger',
        category: p.category,
        riskLevel: p.risk_level,
        ownerName: 'Marcus Vance',
        ownerEmail: 'marcus.vance@onboardos.internal',
        entitlements: [],
        approvalStages: [{ stage: 1, approverRole: 'MANAGER', slaHours: 24 }],
        maxDurationDays: p.max_duration_days || 90,
        reviewFrequencyDays: p.review_frequency_days || 90,
        availableToScopes: { departments: ['Engineering'] },
        requestCount: Number(p.total_requests) || 0,
        activeGrantCount: Number(p.active_grants_count) || 0,
      }));
    } catch {
      return this.fallback.getAccessPackages();
    }
  }

  async getAccessPackage(id: string): Promise<AccessPackage | null> {
    const pkgs = await this.getAccessPackages();
    return pkgs.find((p) => p.id === id) || null;
  }

  async createAccessPackage(pkg: Omit<AccessPackage, 'id' | 'requestCount' | 'activeGrantCount'>): Promise<AccessPackage> {
    return this.fallback.createAccessPackage(pkg);
  }

  async getAccessRequests(requesterId?: string): Promise<AccessRequest[]> {
    return this.fallback.getAccessRequests(requesterId);
  }

  async submitAccessRequest(input: { packageId: string; requesterId: string; justification: string; durationDays: number }): Promise<AccessRequest> {
    return this.fallback.submitAccessRequest(input);
  }

  async approveAccessRequest(requestId: string, approverRole: string, comments?: string): Promise<AccessRequest> {
    try {
      await supabase.rpc('approve_access_request', {
        request_id: requestId,
        decision: 'APPROVED',
        note: comments,
      });
    } catch {
      // ignore
    }
    return this.fallback.approveAccessRequest(requestId, approverRole, comments);
  }

  async rejectAccessRequest(requestId: string, approverRole: string, comments: string): Promise<AccessRequest> {
    try {
      await supabase.rpc('approve_access_request', {
        request_id: requestId,
        decision: 'REJECTED',
        note: comments,
      });
    } catch {
      // ignore
    }
    return this.fallback.rejectAccessRequest(requestId, approverRole, comments);
  }

  async getAccessGrants(employeeId?: string): Promise<AccessGrant[]> {
    try {
      let query = supabase.from('active_access_grants').select('*');
      if (employeeId) query = query.eq('employee_id', employeeId);
      const { data, error } = await query;

      if (error || !data || data.length === 0) return this.fallback.getAccessGrants(employeeId);

      return data.map((g: any) => ({
        id: g.id,
        employeeId: g.employee_id,
        employeeName: g.employee_name,
        employeeEmail: g.employee_email,
        packageId: g.package_id,
        packageName: 'Core Dev Package',
        entitlementName: g.permission_name,
        app: g.app_name,
        grantedAt: g.granted_at,
        expiresAt: g.expires_at || new Date(Date.now() + 90 * 86400000).toISOString(),
        remainingHours: g.remaining_hours || 2160,
        status: g.status,
        grantedBy: g.source_type,
        renewalEligible: g.renewal_eligible,
        riskLevel: g.entitlement_risk_level || 'LOW',
      }));
    } catch {
      return this.fallback.getAccessGrants(employeeId);
    }
  }

  async renewAccessGrant(grantId: string, additionalDays: number): Promise<AccessGrant> {
    return this.fallback.renewAccessGrant(grantId, additionalDays);
  }

  async revokeAccessGrant(grantId: string, reason: string): Promise<AccessGrant> {
    try {
      await supabase.rpc('revoke_access_grant', {
        grant_id: grantId,
        reason,
      });
    } catch {
      // ignore
    }
    return this.fallback.revokeAccessGrant(grantId, reason);
  }

  async getCertificationCampaigns(): Promise<AccessReviewCampaign[]> {
    return this.fallback.getCertificationCampaigns();
  }

  async getCertificationCampaign(id: string): Promise<AccessReviewCampaign | null> {
    return this.fallback.getCertificationCampaign(id);
  }

  async decideReviewItem(campaignId: string, itemId: string, decision: 'CERTIFY' | 'REVOKE' | 'REVOKE_WITH_EXCEPTION', justification?: string): Promise<AccessReviewItem> {
    return this.fallback.decideReviewItem(campaignId, itemId, decision, justification);
  }

  async getSoDRules(): Promise<SoDRule[]> {
    return this.fallback.getSoDRules();
  }

  async getSoDConflicts(): Promise<SoDConflict[]> {
    return this.fallback.getSoDConflicts();
  }

  async resolveSoDConflict(conflictId: string, action: 'OVERRIDE' | 'REVOKE', note?: string): Promise<SoDConflict> {
    return this.fallback.resolveSoDConflict(conflictId, action, note);
  }

  async getElevationSessions(): Promise<ElevationSession[]> {
    return this.fallback.getElevationSessions();
  }

  async requestJITElevation(input: { employeeId: string; targetSystem: string; privilegedRole: string; durationMinutes: number; reason: string; isEmergency?: boolean }): Promise<ElevationSession> {
    return this.fallback.requestJITElevation(input);
  }

  async revokeElevationSession(sessionId: string): Promise<ElevationSession> {
    return this.fallback.revokeElevationSession(sessionId);
  }

  async getIdentitySources(): Promise<IdentitySource[]> {
    try {
      const { data, error } = await supabase.from('identity_sources').select('*');
      if (error || !data || data.length === 0) return this.fallback.getIdentitySources();

      return data.map((s: any) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        isAuthoritative: s.is_authoritative,
        lastSyncAt: s.last_sync_at,
        accountCount: s.account_count,
        status: s.status,
      }));
    } catch {
      return this.fallback.getIdentitySources();
    }
  }

  async getReconciliationMismatches(): Promise<ReconciliationMismatch[]> {
    return this.fallback.getReconciliationMismatches();
  }

  async runIdentityReconciliation(): Promise<{ mismatches: ReconciliationMismatch[]; scannedAccounts: number }> {
    return this.fallback.runIdentityReconciliation();
  }

  async resolveReconciliationMismatch(mismatchId: string, action: 'AUTO_REMEDIATE' | 'IGNORE'): Promise<ReconciliationMismatch> {
    return this.fallback.resolveReconciliationMismatch(mismatchId, action);
  }

  async getSCIMConnectors(): Promise<SCIMConnector[]> {
    try {
      const { data, error } = await supabase.from('scim_connectors').select('*');
      if (error || !data || data.length === 0) return this.fallback.getSCIMConnectors();

      return data.map((sc: any) => ({
        id: sc.id,
        appName: sc.app_name,
        endpointUrl: sc.endpoint_url,
        scimVersion: sc.scim_version,
        authType: sc.auth_type,
        supportsUsers: sc.supports_users,
        supportsGroups: sc.supports_groups,
        lastHealthCheck: sc.last_health_check,
        syncSuccessRate: Number(sc.sync_success_rate),
        totalSyncedUsers: sc.total_synced_users,
        status: sc.status,
      }));
    } catch {
      return this.fallback.getSCIMConnectors();
    }
  }

  async testSCIMConnector(id: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
    return this.fallback.testSCIMConnector(id);
  }

  async getExternalIdentities(): Promise<ExternalIdentity[]> {
    return this.fallback.getExternalIdentities();
  }

  async createExternalIdentity(input: Omit<ExternalIdentity, 'id' | 'daysRemaining' | 'status'>): Promise<ExternalIdentity> {
    return this.fallback.createExternalIdentity(input);
  }

  async revokeExternalIdentity(id: string, reason: string): Promise<ExternalIdentity> {
    return this.fallback.revokeExternalIdentity(id, reason);
  }

  async getComplianceEvidence(): Promise<ComplianceEvidenceItem[]> {
    return this.fallback.getComplianceEvidence();
  }

  async exportComplianceAuditReport(filters?: any): Promise<{ downloadUrl: string; rowCount: number; checksum: string }> {
    return this.fallback.exportComplianceAuditReport(filters);
  }

  async getStaleAccessItems(): Promise<StaleAccessItem[]> {
    return this.fallback.getStaleAccessItems();
  }

  async reclaimStaleAccess(id: string, action: 'REVOKE_IMMEDIATE' | 'KEPT_WITH_JUSTIFICATION', note?: string): Promise<StaleAccessItem> {
    return this.fallback.reclaimStaleAccess(id, action, note);
  }

  async getDevicePostureSignals(): Promise<DevicePostureSignal[]> {
    return this.fallback.getDevicePostureSignals();
  }

  async getSaaSLicenses(): Promise<SaaSLicense[]> {
    try {
      const { data, error } = await supabase.from('saas_licenses').select('*');
      if (error || !data || data.length === 0) return this.fallback.getSaaSLicenses();

      return data.map((l: any) => ({
        id: l.id,
        appName: l.app_name,
        tier: l.tier,
        totalSeats: l.total_seats,
        assignedSeats: l.assigned_seats,
        inactiveSeats30d: l.inactive_seats_30d,
        costPerSeatMonthly: Number(l.cost_per_seat_monthly),
        potentialMonthlySavings: (l.inactive_seats_30d || 0) * Number(l.cost_per_seat_monthly),
        status: l.status,
      }));
    } catch {
      return this.fallback.getSaaSLicenses();
    }
  }

  async getAgentIdentities(): Promise<AgentIdentity[]> {
    return this.fallback.getAgentIdentities();
  }

  async createAgentIdentity(agent: Omit<AgentIdentity, 'id' | 'lastRunAt'>): Promise<AgentIdentity> {
    return this.fallback.createAgentIdentity(agent);
  }

  async toggleAgentStatus(id: string, status: 'ACTIVE' | 'PAUSED'): Promise<AgentIdentity> {
    return this.fallback.toggleAgentStatus(id, status);
  }

  async getDelegatedAdminScopes(): Promise<DelegatedAdminScope[]> {
    return this.fallback.getDelegatedAdminScopes();
  }

  async getGovernanceAnalytics(): Promise<GovernanceAnalyticsData> {
    try {
      const { data, error } = await supabase.from('governance_analytics').select('*').limit(1).maybeSingle();
      if (error || !data) return this.fallback.getGovernanceAnalytics();

      return {
        day1ReadinessRate: Number(data.day_one_readiness_rate) || 92.0,
        medianOnboardingDays: Number(data.median_onboarding_days) || 3.2,
        accessRequestAverageHours: Number(data.access_request_average_hours) || 4.5,
        reviewCompletionRate: Number(data.review_completion_rate) || 94.0,
        standingPrivilegeCount: Number(data.standing_privilege_count) || 6,
        sodConflictsPrevented: Number(data.sod_conflicts_prevented) || 12,
        staleEntitlementsReclaimed: Number(data.stale_entitlements_reclaimed) || 18,
        monthlyLicenseSavingsUsd: Number(data.monthly_license_savings_usd) || 1450.0,
      };
    } catch {
      return this.fallback.getGovernanceAnalytics();
    }
  }

  async bulkCreateEmployees(employees: CreateEmployeeInput[]): Promise<{ count: number; data: Employee[] }> {
    return this.fallback.bulkCreateEmployees(employees);
  }

  async offboardEmployee(employeeId: string, details?: { exitDate?: string; reason?: string; notes?: string }): Promise<any> {
    return this.fallback.offboardEmployee(employeeId, details);
  }

  async bulkOffboardEmployees(records: Array<{ employeeId?: string; email?: string; reason?: string; exitDate?: string }>): Promise<any> {
    return this.fallback.bulkOffboardEmployees(records);
  }

  async askCopilot(employeeId: string, question: string): Promise<any> {
    return this.fallback.askCopilot(employeeId, question);
  }

  async getIntegrationSettings(): Promise<any> {
    return this.fallback.getIntegrationSettings();
  }

  async updateIntegrationSettings(settings: any): Promise<any> {
    return this.fallback.updateIntegrationSettings(settings);
  }

  async testViaSocketNewEmployee(employeeId?: string): Promise<any> {
    return this.fallback.testViaSocketNewEmployee(employeeId);
  }

  async login(role?: any, email?: string, password?: string): Promise<any> {
    return this.fallback.login(role, email, password);
  }

  async testViaSocketEvent(eventType: string, payload: any): Promise<any> {
    return this.fallback.testViaSocketEvent(eventType, payload);
  }
}

export const supabaseClient = new SupabaseService();

