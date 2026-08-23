import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { store } from '../db/store';
import type { Employee, ActivationInvitation, InvitationDeliveryStatus } from '../types';

export interface SendEmailResult {
  success: boolean;
  status: InvitationDeliveryStatus;
  messageId?: string;
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
          host: 'smtp-relay.brevo.com',
          port: 587,
          secure: false, // TLS via STARTTLS
          auth: {
            user: fromAddress,
            pass: apiKey,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
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

        const messageId = responseData.messageId || `brevo-rest-${Date.now()}`;
        console.log(`✅ [Brevo REST API] Activation email accepted by Brevo for ${employee.email}. Message ID: ${messageId}`);

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
      } catch (err: any) {
        const safeError = err.message || 'Network error connecting to Brevo API';
        console.error(`❌ [Brevo REST API] Network error dispatching email to ${employee.email}:`, safeError);

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
}
