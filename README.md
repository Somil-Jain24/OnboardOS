# OnboardOS — Enterprise Employee Onboarding & Identity Governance Platform

OnboardOS is an AI-assisted, role-governed employee onboarding, access orchestration, and identity lifecycle platform with real transactional email delivery powered by **Supabase Auth** (with **Brevo Custom SMTP Relay**) and workflow orchestration powered by **ViaSocket**.

---

## 🚀 Quick Start (Development & Local Testing)

### 1. Start the Application
```bash
# Terminal 1: Backend API (Port 3001)
cd backend
npm run dev

# Terminal 2: Frontend Client (Port 5173)
cd frontend
npm run dev
```

### 2. Development Test Accounts
The application enforces secure email + password authentication with Argon2id and Supabase Auth sessions. Use the following seeded accounts during development:

| Role | Email | Password |
|---|---|---|
| **HR Operations** | `sarah.chen@onboardos.internal` | `OnboardOS2026!Secure` |
| **Team Manager** | `marcus.vance@onboardos.internal` | `OnboardOS2026!Secure` |
| **New Employee** | `rahul.sharma@onboardos.internal` | `OnboardOS2026!Secure` |
| **IT Operations** | `david.kim@onboardos.internal` | `OnboardOS2026!Secure` |
| **Security Admin** | `elena.rostova@onboardos.internal` | `OnboardOS2026!Secure` |

---

## ✉️ Supabase Auth + Brevo Custom SMTP Configuration

To enable real invitation emails sent directly from Supabase Auth to arbitrary Gmail addresses:

### Step 1: Configure Custom SMTP in Supabase Dashboard
1. Open your Supabase Dashboard: **Project `oqufzquyvmqjdtoedmua` → Authentication → Email / SMTP Settings**.
2. Toggle **Enable Custom SMTP**.
3. Fill in your Brevo SMTP Relay credentials:
   - **SMTP Host**: `smtp-relay.brevo.com`
   - **SMTP Port**: `587`
   - **SMTP User**: The assigned Brevo SMTP login (e.g. `b6557c001@smtp-brevo.com` from Brevo Dashboard → SMTP & API)
   - **SMTP Password**: Your Brevo SMTP key (`xsmtpsib-...`)
   - **Sender Email**: Your verified Brevo sender email (`somiljain024@gmail.com`)
   - **Sender Name**: `OnboardOS HR Team`
4. Click **Save Changes**.

---

### Step 2: Configure Supabase Auth URLs & Redirects
In **Authentication → URL Configuration**:
- **Site URL**: `http://localhost:5173`
- **Redirect URLs**:
  - `http://localhost:5173/auth/callback`
  - `http://localhost:5173/activate`

---

### Step 3: Configure "Invite User" Email Template
In **Authentication → Email Templates → Invite user**:
- **Subject**: `Welcome to OnboardOS — Activate your account`
- **Message Body**:
```html
<h2>Welcome to OnboardOS</h2>
<p>Hello,</p>
<p>You have been invited to join OnboardOS. Click the secure link below to activate your account and create your password:</p>
<p><a href="{{ .ConfirmationURL }}">Activate Workspace Account</a></p>
<p>This invitation link is secure and time-limited. If you were not expecting this invitation, contact your HR team.</p>
<p>Regards,<br>OnboardOS HR Team</p>
```

---

## 🔒 Environment Configuration (`backend/.env`)

```env
PORT=3001
NODE_ENV=development
APP_BASE_URL=http://localhost:5173

# Supabase Auth Configuration
SUPABASE_URL=https://oqufzquyvmqjdtoedmua.supabase.co
SUPABASE_ANON_KEY=replace-with-your-supabase-anon-key
SUPABASE_SECRET_KEY=replace-with-your-supabase-service-role-key

# Brevo Direct SMTP Relay Configuration
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=b6557c001@smtp-brevo.com
BREVO_SMTP_KEY=replace-with-your-brevo-smtp-key
EMAIL_FROM_ADDRESS=somiljain024@gmail.com
EMAIL_FROM_NAME=OnboardOS HR Team
ACTIVATION_TOKEN_TTL_HOURS=72

# ViaSocket Webhook & Callback Security
VIASOCKET_NEW_EMPLOYEE_WEBHOOK_URL=https://flow.sokt.io/func/your-webhook-id
VIASOCKET_EMPLOYEE_ACTIVATION_WEBHOOK_URL=https://flow.sokt.io/func/your-webhook-id
VIASOCKET_CALLBACK_SECRET=replace-with-a-random-32-byte-secret
```

> **Security Note:** Secret keys and SMTP keys must never be committed to Git, printed in logs, or exposed to the client bundle.

---

## 🗄️ Database & Row Level Security (RLS)

All tables in the `public` schema have Row Level Security enabled with granular policies:
- **`public.employees`**:
  - HR & Admin: Full access (`ALL`).
  - Employees: Can only SELECT and UPDATE their own record matching `auth.uid() = auth_user_id`.
- **`public.tasks`**:
  - HR & Admin: Full access.
  - Employees: Can view and claim only their own assigned onboarding tasks.
- **`public.audit_logs`**:
  - HR & Admin: Full access.
  - Employees: Can view only audit entries associated with their employee ID.
- **Trigger `on_auth_user_created`**:
  - Automatically links new `auth.users.id` to `public.employees.auth_user_id` when the invite link is opened.

---

## 🧪 Verification & Diagnostics

```bash
# Run the automated verification suite (38 test cases)
npx tsx src/test-brevo-viasocket-delivery.ts

# Resend Supabase Invite via authenticated API (HR/Admin)
POST /api/employees/:id/resend-supabase-invite
```
