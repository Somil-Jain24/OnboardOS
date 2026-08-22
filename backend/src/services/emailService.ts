import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { store } from '../db/store';
import type { Employee, InvitationDeliveryStatus } from '../types';

export interface SendEmailResult {
  success: boolean;
  status: InvitationDeliveryStatus;
  messageId?: string;
  error?: string;
}

export interface EmailHealthResult {
  healthy: boolean;
  host: string;
  port: number;
  user: string;
  sender: string;
  error?: string;
}

export interface SendTestEmailResult {
  success: boolean;
  messageId?: string;
  accepted?: string[];
  rejected?: string[];
  error?: string;
}

/**
 * Brevo Direct SMTP Transactional Email Service
 * Uses Nodemailer connected directly to Brevo's SMTP relay (smtp-relay.brevo.com:587)
 */
export class EmailService {
  private static transporterInstance: Transporter | null = null;

  /**
   * Initializes or returns a singleton Nodemailer transporter
   */
  private static getTransporter(): Transporter | null {
    const smtpUser = (env.BREVO_SMTP_USER || '').trim();
    const smtpKey = (env.BREVO_SMTP_KEY || env.BREVO_API_KEY || '').trim();

    if (!smtpUser || !smtpKey) {
      return null;
    }

    if (!this.transporterInstance) {
      const host = env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';
      const port = env.BREVO_SMTP_PORT || 587;

      this.transporterInstance = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for 587 / 2525
        requireTLS: true,
        auth: {
          user: smtpUser,
          pass: smtpKey,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });
    }

    return this.transporterInstance;
  }

  /**
   * Diagnostic verification check (transporter.verify)
   */
  public static async verifyHealth(): Promise<EmailHealthResult> {
    const smtpUser = (env.BREVO_SMTP_USER || '').trim();
    const smtpKey = (env.BREVO_SMTP_KEY || env.BREVO_API_KEY || '').trim();
    const host = env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';
    const port = env.BREVO_SMTP_PORT || 587;
    const sender = env.EMAIL_FROM_ADDRESS || 'somiljain024@gmail.com';

    if (!smtpUser || !smtpKey) {
      return {
        healthy: false,
        host,
        port,
        user: smtpUser ? `${smtpUser.split('@')[0]}@***` : 'unconfigured',
        sender,
        error: 'BREVO_SMTP_USER or BREVO_SMTP_KEY is not configured in backend environment.',
      };
    }

    try {
      const transporter = this.getTransporter();
      if (!transporter) {
        throw new Error('Transporter initialization failed.');
      }

      await transporter.verify();
      console.log(`✅ [Brevo SMTP] Connection verified successfully to ${host}:${port} as ${smtpUser}`);

      return {
        healthy: true,
        host,
        port,
        user: smtpUser,
        sender,
      };
    } catch (err: any) {
      const safeError = err.message || 'SMTP connection verification failed';
      console.error(`❌ [Brevo SMTP] Health verification error on ${host}:${port}:`, safeError);

      return {
        healthy: false,
        host,
        port,
        user: smtpUser,
        sender,
        error: safeError,
      };
    }
  }

  /**
   * Sends an account activation email using direct Brevo SMTP Relay
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
Manager: ${employee.managerName || 'Marcus Vance'}
Start date: ${startDateStr}

Activate your OnboardOS account and create your password:

${activationUrl}

This link expires in ${ttlHours} hours and can only be used once.

If you were not expecting this email, contact HR.

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
      Click the secure button below to set your personal password and access your onboarding workspace:
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

    const transporter = this.getTransporter();
    const fromAddress = env.EMAIL_FROM_ADDRESS || 'somiljain024@gmail.com';
    const fromName = env.EMAIL_FROM_NAME || 'OnboardOS HR Team';

    // Recipient domain for safe logging (never logs sensitive payload or tokens)
    const recipientDomain = employee.email.includes('@') ? `@${employee.email.split('@')[1]}` : 'unknown-domain';

    if (!transporter) {
      console.warn(`⚠️ [Brevo SMTP] SMTP credentials not configured. Cannot send email to ${employee.name} (${recipientDomain}).`);

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

    console.log(`✉️ [Brevo SMTP] Sending activation email via ${env.BREVO_SMTP_HOST}:${env.BREVO_SMTP_PORT} from ${fromAddress} to recipient domain ${recipientDomain}...`);

    try {
      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: `"${employee.name}" <${employee.email}>`,
        subject: emailSubject,
        text: textContent,
        html: htmlContent,
      });

      const messageId = info.messageId || `brevo-smtp-${Date.now()}`;
      console.log(`✅ [Brevo SMTP] Email accepted by Brevo relay. Message ID: ${messageId} | Response: ${info.response || '250 OK'}`);

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
      console.error(`❌ [Brevo SMTP] Dispatch failed for ${recipientDomain}:`, safeError);

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

  /**
   * Sends a test email to verify SMTP delivery
   */
  public static async sendTestEmail(toEmail: string): Promise<SendTestEmailResult> {
    const transporter = this.getTransporter();
    const fromAddress = env.EMAIL_FROM_ADDRESS || 'somiljain024@gmail.com';
    const fromName = env.EMAIL_FROM_NAME || 'OnboardOS HR Team';

    if (!transporter) {
      return {
        success: false,
        error: 'BREVO_SMTP_USER or BREVO_SMTP_KEY is not configured in backend environment.',
      };
    }

    try {
      console.log(`✉️ [Brevo SMTP] Sending test email to ${toEmail} from ${fromAddress}...`);

      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: toEmail,
        subject: 'OnboardOS SMTP Integration Test — Delivery Verification',
        text: `Hello,\n\nThis is a test email from OnboardOS verifying that your Brevo SMTP relay connection (smtp-relay.brevo.com:587) is configured and delivering emails successfully.\n\nTimestamp: ${new Date().toISOString()}\nSender: ${fromAddress}\n\nRegards,\nOnboardOS Core Engine`,
        html: `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
  <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h2 style="color: #2563eb; margin-top: 0;">OnboardOS SMTP Delivery Test</h2>
    <p>Your Brevo Direct SMTP Relay is connected and functioning properly!</p>
    <div style="background-color: #f1f5f9; padding: 12px 16px; border-radius: 8px; font-size: 13px; font-family: monospace;">
      <div><strong>Host:</strong> ${env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com'}:${env.BREVO_SMTP_PORT || 587}</div>
      <div><strong>Sender:</strong> ${fromAddress}</div>
      <div><strong>Recipient:</strong> ${toEmail}</div>
      <div><strong>Timestamp:</strong> ${new Date().toISOString()}</div>
    </div>
    <p style="font-size: 12px; color: #64748b; margin-top: 16px;">This email was sent via Nodemailer direct SMTP relay.</p>
  </div>
</body>
</html>`,
      });

      console.log(`✅ [Brevo SMTP] Test email sent successfully! MessageId: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        accepted: (info.accepted as string[]) || [toEmail],
        rejected: (info.rejected as string[]) || [],
      };
    } catch (err: any) {
      const safeError = err.message || 'SMTP test email failed';
      console.error('❌ [Brevo SMTP] Test email failed:', safeError);

      return {
        success: false,
        error: safeError,
      };
    }
  }
}
