import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { store } from '../db/store';
import { EmailService } from './emailService';
import type { Employee } from '../types';

export interface SupabaseInviteResult {
  success: boolean;
  status: 'INVITE_SENT' | 'INVITE_FAILED' | 'SENT_TO_PROVIDER';
  authUserId?: string;
  messageId?: string;
  error?: string;
}

/**
 * Supabase Auth Admin Service
 * Handles server-side user invites, auth linking, and role-governed user creation
 */
export class SupabaseAuthService {
  private static adminClient: SupabaseClient | null = null;

  public static getAdminClient(): SupabaseClient | null {
    if (!this.adminClient) {
      const url = env.SUPABASE_URL || 'https://oqufzquyvmqjdtoedmua.supabase.co';
      // Use service role / secret key if provided, or fallback token
      const key = (process.env.SUPABASE_SECRET_KEY || env.SUPABASE_ANON_KEY || '').trim();

      if (!url || !key) {
        return null;
      }

      this.adminClient = createClient(url, key, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      });
    }
    return this.adminClient;
  }

  /**
   * Invites an employee via Supabase Auth Admin API (with Brevo SMTP fallback)
   */
  public static async inviteEmployee(
    employee: Employee,
    rawToken?: string,
    expiresAt?: string
  ): Promise<SupabaseInviteResult> {
    const supabase = this.getAdminClient();
    const redirectTo = `${env.APP_BASE_URL.replace(/\/+$/, '')}/auth/callback`;

    console.log(`✉️ [Supabase Auth] Sending employee invitation to ${employee.email} (Redirect: ${redirectTo})...`);

    if (supabase && supabase.auth && supabase.auth.admin) {
      try {
        const { data, error } = await supabase.auth.admin.inviteUserByEmail(employee.email, {
          redirectTo,
          data: {
            employee_id: employee.id,
            name: employee.name,
            role: 'EMPLOYEE',
            role_title: employee.roleTitle,
            department: employee.departmentName,
          },
        });

        if (error) {
          console.warn(`⚠️ [Supabase Auth Admin] Invite API returned error for ${employee.email}:`, error.message);
          // Fallback to direct Brevo SMTP email delivery
          if (rawToken && expiresAt) {
            console.log(`✉️ [Fallback] Triggering direct Brevo SMTP email for ${employee.email}...`);
            const brevoRes = await EmailService.sendActivationEmail(employee, rawToken, expiresAt);
            return {
              success: brevoRes.success,
              status: brevoRes.success ? 'SENT_TO_PROVIDER' : 'INVITE_FAILED',
              messageId: brevoRes.messageId,
              error: brevoRes.error || error.message,
            };
          }

          return {
            success: false,
            status: 'INVITE_FAILED',
            error: error.message,
          };
        }

        const authUserId = data?.user?.id;
        console.log(`✅ [Supabase Auth Admin] Invitation accepted for ${employee.email}. Auth User ID: ${authUserId}`);

        // Update employee record
        const storedEmp = store.employees.find((e) => e.id === employee.id);
        if (storedEmp) {
          (storedEmp as any).auth_user_id = authUserId;
          storedEmp.status = 'INVITED';
          storedEmp.updatedAt = new Date().toISOString();
        }

        // Record audit log
        store.auditLogs.unshift({
          id: `aud-${Date.now()}`,
          employeeId: employee.id,
          actorRole: 'ADMIN',
          action: 'SUPABASE_AUTH_INVITE_SENT',
          entityType: 'Employee',
          entityId: employee.id,
          reason: `Supabase Auth invitation dispatched to ${employee.email}`,
          result: 'SUCCESS',
          createdAt: new Date().toISOString(),
        });

        return {
          success: true,
          status: 'INVITE_SENT',
          authUserId,
        };
      } catch (err: any) {
        console.warn(`⚠️ [Supabase Auth Admin] Exception during invite for ${employee.email}:`, err.message);
      }
    }

    // Direct Brevo SMTP Delivery fallback
    if (rawToken && expiresAt) {
      console.log(`✉️ [Brevo SMTP] Dispatching direct activation email for ${employee.email}...`);
      const brevoRes = await EmailService.sendActivationEmail(employee, rawToken, expiresAt);
      return {
        success: brevoRes.success,
        status: brevoRes.success ? 'SENT_TO_PROVIDER' : 'INVITE_FAILED',
        messageId: brevoRes.messageId,
        error: brevoRes.error,
      };
    }

    return {
      success: false,
      status: 'INVITE_FAILED',
      error: 'Supabase Admin auth client is unconfigured and no token was provided.',
    };
  }

  /**
   * Resends a Supabase Auth invitation to an unactivated employee
   */
  public static async resendInvite(employeeId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const employee = store.employees.find((e) => e.id === employeeId);
    if (!employee) {
      return { success: false, error: 'Employee not found.' };
    }

    if (employee.status === 'ACTIVE') {
      return { success: false, error: 'Employee account is already activated and active.' };
    }

    const result = await this.inviteEmployee(employee);
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to resend Supabase invitation.' };
    }

    return {
      success: true,
      message: `Supabase invitation successfully resent to ${employee.email}.`,
    };
  }
}
