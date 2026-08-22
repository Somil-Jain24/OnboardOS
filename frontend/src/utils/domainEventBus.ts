// ============================================================================
// OnboardOS Unified Domain Event Bus
// Dual-Transport: Browser BroadcastChannel (Demo/Mock) + Supabase Realtime Fallback
// ============================================================================

export type DomainEventType =
  | 'employee.created'
  | 'employee.offboarded'
  | 'onboarding.plan_generated'
  | 'approval.requested'
  | 'approval.approved'
  | 'approval.rejected'
  | 'task.ready'
  | 'task.completed'
  | 'task.failed'
  | 'task.retry_succeeded'
  | 'task.unblocked'
  | 'exception.created'
  | 'exception.resolved'
  | 'readiness.updated'
  | 'onboarding.day_one_ready'
  | 'automation.dispatched'
  | 'automation.failed';

export type EventPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EventSource = 'SUPABASE_REALTIME' | 'BROWSER_BUS' | 'LOCAL_ACTION' | 'AUTOMATION';

export interface DomainEvent {
  id: string;
  type: DomainEventType;
  timestamp: string;
  actorName?: string;
  actorRole?: 'ADMIN' | 'HR' | 'IT' | 'MANAGER' | 'EMPLOYEE' | 'SYSTEM';
  employeeId?: string;
  employeeName?: string;
  entityType: 'Employee' | 'Task' | 'Approval' | 'Exception' | 'Plan' | 'Automation';
  entityId?: string;
  summary: string;
  priority: EventPriority;
  source: EventSource;
  metadata?: Record<string, any>;
}

export type ConnectionState = {
  status: 'CONNECTED' | 'DEMO_BUS' | 'OFFLINE';
  source: string;
  label: string;
  color: 'emerald' | 'amber' | 'slate';
};

class DomainEventBus {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(event: DomainEvent) => void> = new Set();
  private recentEvents: DomainEvent[] = [];
  private readonly MAX_HISTORY = 50;
  private readonly CHANNEL_NAME = 'onboardos_domain_events';

  constructor() {
    this.initChannel();
    this.initSeedEvents();
  }

  private initChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(this.CHANNEL_NAME);
        this.channel.onmessage = (messageEvent) => {
          if (messageEvent.data && messageEvent.data.type) {
            const event: DomainEvent = messageEvent.data;
            this.recordAndNotify(event, false);
          }
        };
      } catch (err) {
        console.warn('[DomainEventBus] BroadcastChannel not available:', err);
      }
    }
  }

  private initSeedEvents() {
    const now = new Date();
    const iso = (minsAgo: number) => new Date(now.getTime() - minsAgo * 60000).toISOString();

    this.recentEvents = [
      {
        id: 'evt-seed-4',
        type: 'automation.dispatched',
        timestamp: iso(2),
        actorName: 'OnboardOS Automation Engine',
        actorRole: 'SYSTEM',
        employeeId: 'emp-rahul',
        employeeName: 'Rahul Sharma',
        entityType: 'Automation',
        entityId: 'viasocket-emp-rahul',
        summary: 'ViaSocket webhook dispatched: HR & IT Slack alerts and Google Sheet tracking row created.',
        priority: 'MEDIUM',
        source: 'AUTOMATION',
      },
      {
        id: 'evt-seed-3',
        type: 'approval.requested',
        timestamp: iso(5),
        actorName: 'Policy Engine (SOC-2 Rule v1.2)',
        actorRole: 'SYSTEM',
        employeeId: 'emp-rahul',
        employeeName: 'Rahul Sharma',
        entityType: 'Approval',
        entityId: 'appr-rahul-aws',
        summary: 'AWS Production Cloud IAM approval routed to Engineering Director Marcus Vance (SLA: 4h).',
        priority: 'HIGH',
        source: 'LOCAL_ACTION',
      },
      {
        id: 'evt-seed-2',
        type: 'task.failed',
        timestamp: iso(8),
        actorName: 'Jira Software SCIM Adapter',
        actorRole: 'SYSTEM',
        employeeId: 'emp-rahul',
        employeeName: 'Rahul Sharma',
        entityType: 'Task',
        entityId: 'task-rahul-jira',
        summary: 'Jira account provisioning failed with HTTP 503 Rate Limit. Exception logged in Exception Center.',
        priority: 'CRITICAL',
        source: 'LOCAL_ACTION',
      },
      {
        id: 'evt-seed-1',
        type: 'employee.created',
        timestamp: iso(15),
        actorName: 'Sarah Chen',
        actorRole: 'HR',
        employeeId: 'emp-rahul',
        employeeName: 'Rahul Sharma',
        entityType: 'Employee',
        entityId: 'emp-rahul',
        summary: 'New employee profile Rahul Sharma created for Engineering (Payments Core). DAG plan initialized.',
        priority: 'MEDIUM',
        source: 'LOCAL_ACTION',
      },
    ];
  }

  private recordAndNotify(event: DomainEvent, broadcast = true) {
    // Prevent duplicate recording by ID
    if (!this.recentEvents.some((e) => e.id === event.id)) {
      this.recentEvents.unshift(event);
      if (this.recentEvents.length > this.MAX_HISTORY) {
        this.recentEvents.pop();
      }
    }

    // Broadcast across tabs if initiated locally
    if (broadcast && this.channel) {
      try {
        this.channel.postMessage(event);
      } catch (err) {
        console.warn('[DomainEventBus] Error broadcasting event:', err);
      }
    }

    // Notify local subscribers
    this.listeners.forEach((callback) => {
      try {
        callback(event);
      } catch (err) {
        console.error('[DomainEventBus] Listener error:', err);
      }
    });
  }

  public emit(
    eventInput: Omit<DomainEvent, 'id' | 'timestamp' | 'source'> & {
      id?: string;
      timestamp?: string;
      source?: EventSource;
    }
  ): DomainEvent {
    const isMock = (import.meta as any).env?.VITE_DATA_MODE !== 'api';
    const event: DomainEvent = {
      id: eventInput.id || `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: eventInput.timestamp || new Date().toISOString(),
      source: eventInput.source || (isMock ? 'BROWSER_BUS' : 'LOCAL_ACTION'),
      ...eventInput,
    };

    this.recordAndNotify(event, true);
    return event;
  }

  public subscribe(callback: (event: DomainEvent) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public getRecentEvents(limit = 10, filterRole?: string, filterEmployeeId?: string): DomainEvent[] {
    let list = [...this.recentEvents];
    if (filterEmployeeId) {
      list = list.filter((e) => !e.employeeId || e.employeeId === filterEmployeeId);
    }
    return list.slice(0, limit);
  }

  public getConnectionState(): ConnectionState {
    const isApi = (import.meta as any).env?.VITE_DATA_MODE === 'api';
    if (isApi) {
      return {
        status: 'CONNECTED',
        source: 'OnboardOS Local API Bus',
        label: 'Local API Sync',
        color: 'emerald',
      };
    }
    if (this.channel) {
      return {
        status: 'DEMO_BUS',
        source: 'Browser BroadcastChannel Bus',
        label: 'Local Cross-Tab Sync',
        color: 'amber',
      };
    }
    return {
      status: 'OFFLINE',
      source: 'In-Memory State',
      label: 'Sync Offline',
      color: 'slate',
    };
  }
}

export const domainEventBus = new DomainEventBus();
export const emitDomainEvent = (e: Parameters<DomainEventBus['emit']>[0]) => domainEventBus.emit(e);
export const subscribeToDomainEvents = (cb: (event: DomainEvent) => void) => domainEventBus.subscribe(cb);
export const getRealtimeConnectionState = () => domainEventBus.getConnectionState();
export const getRecentDomainEvents = (limit?: number, role?: string, empId?: string) =>
  domainEventBus.getRecentEvents(limit, role, empId);
