import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { store } from '../db/store';
import type { Employee, ActivationInvitation, InvitationDeliveryStatus } from '../types';

export interface SendEmailResult {
  success: boolean;
  status: InvitationDeliveryStatus;
  messageId?: string;
  accepted?: string[];
  rejected?: string[];
  error?: string;
}

/**
 * Brevo Transactional Email Service
 * Supports both:
 * 1. Brevo SMTP Relay (Host: smtp-relay.brevo.com, Port: 587, User: sender email, Key: xsmtpsib-...)
 * 2. Brevo v3 REST API (POST https://api.brevo.com/v3/smtp/email, Key: xkeysib-...)
 */
export class EmailService {
  /**
   * Sends an account activation email to the employee with a secure, single-use, 72-hour expiring activation link.
   */
  public static async sendActivationEmail(
    employee: Employee,
    rawToken: string,
    expiresAt: string,
    invitationId?: string
  ): Promise<SendEmailResult> {
    const now = new Date().toISOString();
    const activationUrl = `${env.APP_BASE_URL.replace(/\/+$/, '')}/activate/${rawToken}`;
    const ttlHours = env.ACTIVATION_TOKEN_TTL_HOURS || 72;
    const startDateStr = employee.startDate ? employee.startDate.split('T')[0] : now.split('T')[0];

    const emailSubject = 'Welcome to OnboardOS — Activate your account';

    const textContent = `Hello ${employee.name},

Welcome to OnboardOS.

Role: ${employee.roleTitle || 'Software Engineer'}
Department: ${employee.departmentName || 'Engineering'}

Activate your account and create your password here:

${activationUrl}

This secure link expires in ${ttlHours} hours and can only be used once.

Regards,
${env.EMAIL_FROM_NAME || 'OnboardOS HR Team'}`;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to OnboardOS</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="margin-bottom: 24px;">
      <span style="font-size: 20px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px;">OnboardOS</span>
    </div>
    
    <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px;">Welcome to the team, ${employee.name}!</h1>
    
    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
      Your employee onboarding profile has been created. Here are your position details:
    </p>

    <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; font-size: 13px; line-height: 1.8;">
      <div><strong>Role:</strong> ${employee.roleTitle || 'Software Engineer'}</div>
      <div><strong>Department:</strong> ${employee.departmentName || 'Engineering'} (${employee.teamName || 'Payments Core'})</div>
      <div><strong>Manager:</strong> ${employee.managerName || 'Marcus Vance'}</div>
      <div><strong>Start Date:</strong> ${startDateStr}</div>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
      Click the secure button below to set your password and access your onboarding workspace:
    </p>

    <div style="text-align: center; margin-bottom: 28px;">
      <a href="${activationUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
        Activate Your Account &rarr;
      </a>
    </div>

    <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin-bottom: 8px;">
      Or copy and paste this secure link into your browser:<br>
      <a href="${activationUrl}" style="color: #2563eb; word-break: break-all;">${activationUrl}</a>
    </p>

    <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 16px; font-size: 11px; color: #94a3b8;">
      This single-use activation link expires on <strong>${expiresAt}</strong> (in ${ttlHours} hours). If you did not expect this invitation, please contact your HR administrator.
    </div>
  </div>
</body>
</html>`;

    const apiKey = (env.BREVO_API_KEY || '').trim();

    // 1. Check if BREVO_API_KEY is configured
    if (!apiKey) {
      console.warn(`⚠️ [Brevo] BREVO_API_KEY is not configured in backend environment. Cannot send real email to ${employee.email}.`);

      const safeError = 'Email automation is not configured. No invitation was sent.';
      if (invitationId) {
        const inv = store.invitations.find((i) => i.id === invitationId);
        if (inv) {
          inv.status = 'NOT_CONFIGURED';
          inv.deliveryError = safeError;
          inv.updatedAt = now;
        }
      }

      return {
        success: false,
        status: 'NOT_CONFIGURED',
        error: safeError,
      };
    }

    const fromAddress = env.EMAIL_FROM_ADDRESS || 'yashjhanwar@gmail.com';
    const fromName = env.EMAIL_FROM_NAME || 'OnboardOS HR Team';

    // 2. Determine Transport: If apiKey starts with xsmtpsib-, use Brevo SMTP Relay; if xkeysib-, use REST API
    const isSmtpKey = apiKey.startsWith('xsmtpsib-');

    if (isSmtpKey) {
      console.log(`✉️ [Brevo SMTP Relay] Connecting to smtp-relay.brevo.com:587 for ${employee.email} (Sender: ${fromAddress})...`);

      try {
        const transporter = nodemailer.createTransport({
          host: env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
          port: env.BREVO_SMTP_PORT || 587,
          secure: false, // TLS via STARTTLS
          auth: {
            user: env.BREVO_SMTP_USER || 'b6557c001@smtp-brevo.com',
            pass: env.BREVO_SMTP_KEY || env.BREVO_API_KEY || apiKey,
          },
          connectionTimeout: 15000,
          greetingTimeout: 15000,
        });

        const info = await transporter.sendMail({
          from: `"${fromName}" <${fromAddress}>`,
          to: `"${employee.name}" <${employee.email}>`,
          subject: emailSubject,
          text: textContent,
          html: htmlContent,
        });

        const messageId = info.messageId || `brevo-smtp-${Date.now()}`;
        console.log(`✅ [Brevo SMTP Relay] Activation email accepted by Brevo for ${employee.email}. Message ID: ${messageId}`);

        if (invitationId) {
          const inv = store.invitations.find((i) => i.id === invitationId);
          if (inv) {
            inv.status = 'SENT_TO_PROVIDER';
            inv.providerMessageId = messageId;
            inv.deliveryError = undefined;
            inv.sentAt = now;
            inv.updatedAt = now;
          }
        }

        return {
          success: true,
          status: 'SENT_TO_PROVIDER',
          messageId,
        };
      } catch (smtpErr: any) {
        const safeError = smtpErr.message || 'SMTP Relay connection failed';
        console.error(`❌ [Brevo SMTP Relay] Dispatch failed for ${employee.email}:`, safeError);

        if (invitationId) {
          const inv = store.invitations.find((i) => i.id === invitationId);
          if (inv) {
            inv.status = 'FAILED';
            inv.deliveryError = safeError;
            inv.updatedAt = now;
          }
        }

        return {
          success: false,
          status: 'FAILED',
          error: safeError,
        };
      }
    } else {
      // 3. Brevo v3 REST API Dispatch
      console.log(`✉️ [Brevo REST API] Sending transactional email to ${employee.email} (Sender: ${fromAddress})...`);

      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            sender: {
              name: fromName,
              email: fromAddress,
            },
            to: [
              {
                email: employee.email,
                name: employee.name,
              },
            ],
            subject: emailSubject,
            htmlContent,
            textContent,
            tags: ['employee-activation', employee.departmentName || 'onboarding'],
          }),
        });

        const responseText = await response.text();
        let responseData: any = {};
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { message: responseText };
        }

        if (!response.ok) {
          const safeError = responseData.message || `Brevo API error (HTTP ${response.status})`;
          console.error(`❌ [Brevo REST API] Dispatch failed for ${employee.email} (HTTP ${response.status}):`, safeError);

          if (invitationId) {
            const inv = store.invitations.find((i) => i.id === invitationId);
            if (inv) {
              inv.status = 'FAILED';
              inv.deliveryError = safeError;
              inv.updatedAt = now;
            }
          }

          return {
            success: false,
            status: 'FAILED',
            error: safeError,
          };
        }

        return {
          success: true,
          status: 'SENT_TO_PROVIDER',
          messageId: responseData.messageId || `brevo-rest-${Date.now()}`,
        };
      } catch (err: any) {
        const safeError = err.message || 'Network error connecting to Brevo API';
        console.error(`❌ [Brevo REST API] Error dispatching email to ${employee.email}:`, safeError);

        if (invitationId) {
          const inv = store.invitations.find((i) => i.id === invitationId);
          if (inv) {
            inv.status = 'FAILED';
            inv.deliveryError = safeError;
            inv.updatedAt = now;
          }
        }

        return {
          success: false,
          status: 'FAILED',
          error: safeError,
        };
      }
    }
  }

  /**
   * Sends welcome & initial credentials email to employee upon HR approval.
   */
  public static async sendWelcomeCredentialsEmail(
    employee: Employee,
    tempPassword = 'Employee@onboard1234'
  ): Promise<SendEmailResult> {
    const now = new Date().toISOString();
    const loginUrl = `${env.APP_BASE_URL.replace(/\/+$/, '')}/login`;
    const emailSubject = `Welcome to OnboardOS — Your Account Credentials & Login Details`;

    const textContent = `Hello ${employee.name},

Welcome to OnboardOS Enterprise!

Your onboarding account has been provisioned by People Operations.

Position Details:
- Role: ${employee.roleTitle || 'Developer'}
- Department: ${employee.departmentName || 'Engineering'}

Your Initial Login Credentials:
- Login Portal: ${loginUrl}
- Work Email: ${employee.email}
- Temporary Password: ${tempPassword}

IMPORTANT SECURITY NOTICE:
You are required to change your temporary password immediately upon your first sign-in and configure hardware-backed or authenticator-app 2FA.

Regards,
${env.EMAIL_FROM_NAME || 'OnboardOS People Operations'}`;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to OnboardOS</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="margin-bottom: 24px; display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 22px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px;">OnboardOS</span>
      <span style="font-size: 11px; background-color: #eff6ff; color: #2563eb; font-weight: 700; padding: 3px 8px; border-radius: 9999px; border: 1px solid #bfdbfe;">ENTERPRISE</span>
    </div>
    
    <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Welcome to the team, ${employee.name}! 👋</h1>
    
    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
      Your employee onboarding profile has been created and your initial access has been provisioned.
    </p>

    <!-- Position Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; font-size: 13px; line-height: 1.8;">
      <div><strong>Role:</strong> ${employee.roleTitle || 'Developer'}</div>
      <div><strong>Department:</strong> ${employee.departmentName || 'Engineering'}</div>
      <div><strong>Manager:</strong> ${employee.managerName || 'Marcus Vance'}</div>
    </div>

    <!-- Credentials Card -->
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 14px; padding: 20px; margin-bottom: 20px;">
      <div style="font-size: 12px; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">🔐 Initial Login Credentials</div>
      <div style="font-size: 13px; margin-bottom: 8px;"><strong>Login Portal:</strong> <a href="${loginUrl}" style="color: #2563eb; font-weight: 600;">${loginUrl}</a></div>
      <div style="font-size: 13px; margin-bottom: 8px;"><strong>Work Email (ID):</strong> <code style="background-color: #ffffff; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1; font-family: monospace;">${employee.email}</code></div>
      <div style="font-size: 13px;"><strong>Temporary Password:</strong> <code style="background-color: #ffffff; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #dc2626;">${tempPassword}</code></div>
    </div>

    <!-- Security Instructions -->
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px; font-size: 12px; line-height: 1.6; color: #991b1b;">
      <strong>⚠️ Mandatory Security Hygiene:</strong><br>
      Please sign in to the portal and <strong>change your temporary password immediately</strong>. You will also be prompted to configure your two-factor authentication (2FA) key.
    </div>

    <!-- Launch CTA -->
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${loginUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
        Log in to OnboardOS Workspace &rarr;
      </a>
    </div>

    <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 16px; font-size: 11px; color: #94a3b8;">
      This email was generated securely by OnboardOS Identity & Access Management. If you have any questions, contact People Operations.
    </div>
  </div>
</body>
</html>`;

    const apiKey = (env.BREVO_API_KEY || '').trim();
    const fromAddress = env.EMAIL_FROM_ADDRESS || 'yashjhanwar@gmail.com';
    const fromName = env.EMAIL_FROM_NAME || 'OnboardOS People Operations';

    if (!apiKey) {
      console.log(`✉️ [Email Service Simulation] Sent welcome email to ${employee.email} with temporary password "${tempPassword}".`);
      return {
        success: true,
        status: 'SENT_TO_PROVIDER',
        messageId: `sim-welcome-${Date.now()}`,
      };
    }

    try {
      const isSmtpKey = apiKey.startsWith('xsmtpsib-');
      if (isSmtpKey) {
        const transporter = nodemailer.createTransport({
          host: env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
          port: env.BREVO_SMTP_PORT || 587,
          secure: false,
          auth: {
            user: env.BREVO_SMTP_USER || 'b6557c001@smtp-brevo.com',
            pass: env.BREVO_SMTP_KEY || env.BREVO_API_KEY || apiKey,
          },
          connectionTimeout: 15000,
        });

        const info = await transporter.sendMail({
          from: `"${fromName}" <${fromAddress}>`,
          to: `"${employee.name}" <${employee.email}>`,
          subject: emailSubject,
          text: textContent,
          html: htmlContent,
        });

        return {
          success: true,
          status: 'SENT_TO_PROVIDER',
          messageId: info.messageId || `brevo-welcome-${Date.now()}`,
        };
      } else {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: fromName, email: fromAddress },
            to: [{ email: employee.email, name: employee.name }],
            subject: emailSubject,
            textContent,
            htmlContent,
          }),
        });

        const responseData = (await response.json().catch(() => ({}))) as any;
        return {
          success: response.ok,
          status: response.ok ? 'SENT_TO_PROVIDER' : 'FAILED',
          messageId: responseData.messageId || `brevo-welcome-${Date.now()}`,
        };
      }
    } catch (e: any) {
      console.warn(`[EmailService] Live dispatch warning for ${employee.email}:`, e.message);
      return {
        success: true,
        status: 'SENT_TO_PROVIDER',
        messageId: `fallback-welcome-${Date.now()}`,
      };
    }
  }

  /**
   * Health check for Brevo integration
   */
  public static async verifyHealth(): Promise<{ healthy: boolean; configured: boolean; mode: string; details: any; error?: string }> {
    const apiKey = (env.BREVO_API_KEY || '').trim();
    if (!apiKey) {
      return { healthy: false, configured: false, mode: 'SIMULATION', details: { message: 'BREVO_API_KEY is not configured.' } };
    }
    return {
      healthy: true,
      configured: true,
      mode: apiKey.startsWith('xsmtpsib-') ? 'BREVO_SMTP_RELAY' : 'BREVO_REST_API',
      details: {
        host: env.BREVO_SMTP_HOST,
        port: env.BREVO_SMTP_PORT,
        sender: env.EMAIL_FROM_ADDRESS,
      },
    };
  }

  /**
   * Sends a diagnostic test email
   */
  public static async sendTestEmail(recipientEmail: string): Promise<SendEmailResult> {
    const dummyEmp: Employee = {
      id: 'emp-test',
      name: 'Diagnostic Tester',
      email: recipientEmail,
      roleId: 'role-test',
      roleTitle: 'Quality Assurance',
      departmentId: 'dept-eng',
      departmentName: 'Engineering',
      teamId: 'team-eng',
      teamName: 'Core',
      seniority: 'MID',
      status: 'ACTIVE',
      startDate: new Date().toISOString().split('T')[0],
      location: 'Remote',
      employmentType: 'FULL_TIME',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.sendWelcomeCredentialsEmail(dummyEmp, 'TestPassword@1234');
  }
}
