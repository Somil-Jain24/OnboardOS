import { createClient, RealtimeChannel } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vmtxrdtcdfqwlsjmomkz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtdHhyZHRjZGZxd2xzam1vbWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyOTIwOTMsImV4cCI6MjEwMjg2ODA5M30.V9fkZNb732cKb844M04evzS8NRS1QCIQhdVnV68oa-4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Real-time Subscription Helpers

export function subscribeToTasks(
  employeeId: string | undefined, 
  callback: (payload: { eventType: string; new: unknown; old: unknown }) => void
): RealtimeChannel {
  const channelName = employeeId ? `tasks:emp:${employeeId}` : 'tasks:all';
  const filter = employeeId ? `employee_id=eq.${employeeId}` : undefined;

  const channel = supabase.channel(channelName).on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'tasks',
      ...(filter ? { filter } : {}),
    },
    (payload) => {
      callback({
        eventType: payload.eventType,
        new: payload.new,
        old: payload.old,
      });
    }
  );

  channel.subscribe();
  return channel;
}

export function subscribeToApprovals(
  callback: (payload: { eventType: string; new: unknown; old: unknown }) => void
): RealtimeChannel {
  const channel = supabase.channel('approvals:all').on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'approvals',
    },
    (payload) => {
      callback({
        eventType: payload.eventType,
        new: payload.new,
        old: payload.old,
      });
    }
  );

  channel.subscribe();
  return channel;
}

export function subscribeToNotifications(
  userId: string | undefined,
  callback: (payload: { eventType: string; new: unknown; old: unknown }) => void
): RealtimeChannel {
  const channelName = userId ? `notifications:user:${userId}` : 'notifications:all';
  const filter = userId ? `user_id=eq.${userId}` : undefined;

  const channel = supabase.channel(channelName).on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'notifications',
      ...(filter ? { filter } : {}),
    },
    (payload) => {
      callback({
        eventType: payload.eventType,
        new: payload.new,
        old: payload.old,
      });
    }
  );

  channel.subscribe();
  return channel;
}
