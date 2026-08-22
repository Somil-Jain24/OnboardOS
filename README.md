# OnboardOS — Enterprise Employee Onboarding & Identity Governance Platform

OnboardOS is an AI-assisted, role-governed employee onboarding, access orchestration, and identity lifecycle platform.

---

## ⚡ ViaSocket Live Event-Driven Automation

OnboardOS features a live, non-blocking webhook automation dispatcher powered by **ViaSocket**. Whenever HR creates a new employee profile in OnboardOS, an `employee.created` event is automatically dispatched to trigger Slack alerts and log records in Google Sheets.

### 1. Webhook Configuration

Configure the webhook URL in your server-side environment (`.env` or `backend/.env`):

```bash
# Server-side only (Do NOT expose to frontend / VITE_)
VIASOCKET_NEW_EMPLOYEE_WEBHOOK_URL=https://flow.sokt.io/func/your_employee_created_flow
APP_BASE_URL=http://localhost:5173
```

> 🔒 **Security Note**: The ViaSocket webhook URL, API secrets, and payload signing are strictly kept on the Node.js backend. They are never exposed to browser or client code.

---

### 2. How to Test Locally

#### Option A: Run the Automated CLI Test Script
```bash
cd backend
npx tsx src/test-viasocket.ts
```

#### Option B: Trigger the Demo API Endpoint
Make a `POST` request to the safe demo automation test endpoint:
```bash
curl -X POST http://localhost:3001/api/demo/automation/new-employee-test \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "emp-rahul",
    "name": "Rahul Sharma",
    "email": "rahul.sharma@enterprise.com",
    "roleTitle": "Junior Backend Developer",
    "department": "Engineering",
    "team": "Payments Core"
  }'
```

#### Option C: Create an Employee in the UI
1. Open OnboardOS at `http://localhost:5173/`
2. Switch role to **HR Operations (Sarah)**
3. Navigate to **HR Command Center** → **Add New Employee** (`/hr/employees/new`)
4. Fill out the profile and click **Create Employee Profile**
5. The backend automatically saves the employee and dispatches the ViaSocket webhook in the background.

---

### 3. How to Confirm Success

When a dispatch succeeds:
1. **ViaSocket Webhook**: Returns HTTP `200` with `{ "received": true }`.
2. **HR & IT Slack Channels**: Receive real-time rich notification cards with employee details, department, start date, and deep link to the employee's onboarding command center.
3. **Google Sheets (`Sheet1`)**: A new row is appended with the joiner's metadata (`ID`, `Name`, `Email`, `Department`, `Role`, `Manager`, `Start Date`, `Created At`).
4. **OnboardOS Audit Log**: Records a cryptographic `VIASOCKET_AUTOMATION_DISPATCHED` audit entry.

---

### 4. Idempotency & Fault Tolerance
* **Duplicate Prevention**: Every event is assigned an `idempotency_key` (e.g. `employee-created-<employee-id>`). Retrying the same event skips duplicate external calls.
* **Non-Blocking Resilience**: If ViaSocket or the network is temporarily unreachable, the 10-second timeout catches the exception and logs an audit record without blocking employee creation in OnboardOS.

---

## 🛠️ Tech Stack
* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, React Flow
* **Backend**: Node.js, Express, TypeScript, Zod, Supabase PostgreSQL, Prisma
* **Automation**: ViaSocket Webhooks, Slack, Google Sheets