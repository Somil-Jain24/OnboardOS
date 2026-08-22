import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// HR Pages
import { HRDashboardPage } from './pages/hr/HRDashboardPage';
import { EmployeeListPage } from './pages/hr/EmployeeListPage';
import { CreateEmployeePage } from './pages/hr/CreateEmployeePage';
import { HROffboardingPage } from './pages/hr/HROffboardingPage';
import { ExceptionCenterPage } from './pages/hr/ExceptionCenterPage';

// Consolidated Employee Command Center
import { EmployeeCommandCenterPage } from './pages/command-center/EmployeeCommandCenterPage';

// Manager Pages
import { ManagerDashboardPage } from './pages/manager/ManagerDashboardPage';
import { ApprovalQueuePage } from './pages/manager/ApprovalQueuePage';

// Employee Self-Service Pages
import { EmployeeDashboardPage } from './pages/employee/EmployeeDashboardPage';
import { MyTasksPage } from './pages/employee/MyTasksPage';
import { AIAssistantPage } from './pages/employee/AIAssistantPage';
import { HelpdeskPage } from './pages/employee/HelpdeskPage';

// IT Pages
import { ITDashboardPage } from './pages/it/ITDashboardPage';
import { TicketQueuePage } from './pages/it/TicketQueuePage';
import { AssetManagementPage } from './pages/it/AssetManagementPage';
import { OffboardingRisksPage } from './pages/it/OffboardingRisksPage';

// Admin & Policy Pages
import { BirthrightPolicyPage } from './pages/admin/BirthrightPolicyPage';
import { RolesPolicyPage } from './pages/admin/RolesPolicyPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';

// Cross-Role Features & Demo
import { KnowledgeAssistantPage } from './pages/knowledge/KnowledgeAssistantPage';
import { DemoControlPage } from './pages/demo/DemoControlPage';
import { LoginPage } from './pages/auth/LoginPage';

// Subroute Redirector Component
function EmployeeSubrouteRedirect({ tab }: { tab: string }) {
  const { id = 'emp-rahul' } = useParams();
  return <Navigate to={`/employees/${id}?tab=${tab}`} replace />;
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected App Layout */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/hr" replace />} />

          {/* HR Core Routes */}
          <Route path="hr" element={<HRDashboardPage />} />
          <Route path="hr/employees" element={<EmployeeListPage />} />
          <Route path="hr/employees/new" element={<CreateEmployeePage />} />
          <Route path="hr/offboarding" element={<HROffboardingPage />} />
          <Route path="hr/employees/:id" element={<Navigate to="/employees/:id" replace />} />
          <Route path="hr/exceptions" element={<ExceptionCenterPage />} />

          {/* Unified Employee Command Center */}
          <Route path="employees/:id" element={<EmployeeCommandCenterPage />} />
          <Route path="employees/:id/plan" element={<EmployeeSubrouteRedirect tab="access" />} />
          <Route path="employees/:id/access" element={<EmployeeSubrouteRedirect tab="access" />} />
          <Route path="employees/:id/provisioning" element={<EmployeeSubrouteRedirect tab="access" />} />
          <Route path="employees/:id/timeline" element={<EmployeeSubrouteRedirect tab="activity" />} />
          <Route path="employees/:id/risk" element={<EmployeeSubrouteRedirect tab="overview" />} />
          <Route path="employees/:id/tasks" element={<EmployeeSubrouteRedirect tab="tasks" />} />
          <Route path="employees/:id/first-week" element={<EmployeeSubrouteRedirect tab="tasks" />} />
          <Route path="employees/:id/offboarding" element={<EmployeeSubrouteRedirect tab="activity" />} />
          <Route path="employees/:id/mentor" element={<EmployeeSubrouteRedirect tab="overview" />} />
          <Route path="employees/:id/whatif" element={<EmployeeSubrouteRedirect tab="access" />} />
          <Route path="employees/:id/transfer" element={<EmployeeSubrouteRedirect tab="activity" />} />

          {/* Manager Routes */}
          <Route path="manager" element={<ManagerDashboardPage />} />
          <Route path="manager/approvals" element={<ApprovalQueuePage />} />
          <Route path="manager/approvals/:id" element={<ApprovalQueuePage />} />

          {/* Employee Self-Service Routes */}
          <Route path="me" element={<EmployeeDashboardPage />} />
          <Route path="me/tasks" element={<MyTasksPage />} />
          <Route path="me/assistant" element={<AIAssistantPage />} />
          <Route path="me/help" element={<HelpdeskPage />} />
          <Route path="me/first-week" element={<Navigate to="/me/tasks" replace />} />
          <Route path="me/mentor" element={<Navigate to="/me" replace />} />
          <Route path="me/pulse" element={<Navigate to="/me" replace />} />

          {/* IT Operations Routes */}
          <Route path="it" element={<ITDashboardPage />} />
          <Route path="it/tickets" element={<TicketQueuePage />} />
          <Route path="it/assets" element={<AssetManagementPage />} />
          <Route path="it/offboarding" element={<OffboardingRisksPage />} />

          {/* Admin Policy & RBAC Routes */}
          <Route path="admin/birthright" element={<BirthrightPolicyPage />} />
          <Route path="admin/roles" element={<RolesPolicyPage />} />
          <Route path="admin/users" element={<UserManagementPage />} />

          {/* Cross-Role Knowledge & Demo */}
          <Route path="knowledge" element={<KnowledgeAssistantPage />} />
          <Route path="_demo" element={<DemoControlPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/hr" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
