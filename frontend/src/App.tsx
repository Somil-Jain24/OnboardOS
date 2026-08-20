import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// HR Pages
import { HRDashboardPage } from './pages/hr/HRDashboardPage';
import { EmployeeListPage } from './pages/hr/EmployeeListPage';
import { CreateEmployeePage } from './pages/hr/CreateEmployeePage';
import { ExceptionCenterPage } from './pages/hr/ExceptionCenterPage';

// Command Center Pages
import { EmployeeCommandCenterPage } from './pages/command-center/EmployeeCommandCenterPage';
import { PlanDetailPage } from './pages/command-center/PlanDetailPage';
import { AccessGraphPage } from './pages/command-center/AccessGraphPage';
import { ProvisioningPage } from './pages/command-center/ProvisioningPage';
import { TimelinePage } from './pages/command-center/TimelinePage';
import { WhatIfPage } from './pages/command-center/WhatIfPage';
import { RiskReadinessPage } from './pages/command-center/RiskReadinessPage';
import { TransferPage } from './pages/command-center/TransferPage';
import { OffboardingPage } from './pages/command-center/OffboardingPage';
import { MentorPage } from './pages/command-center/MentorPage';
import { FirstWeekPage } from './pages/command-center/FirstWeekPage';

// Manager Pages
import { ManagerDashboardPage } from './pages/manager/ManagerDashboardPage';
import { ApprovalQueuePage } from './pages/manager/ApprovalQueuePage';

// Employee Pages
import { EmployeeDashboardPage } from './pages/employee/EmployeeDashboardPage';
import { MyTasksPage } from './pages/employee/MyTasksPage';
import { AIAssistantPage } from './pages/employee/AIAssistantPage';
import { HelpdeskPage } from './pages/employee/HelpdeskPage';
import { MyFirstWeekPage } from './pages/employee/MyFirstWeekPage';
import { MyMentorPage } from './pages/employee/MyMentorPage';
import { PulseCheckPage } from './pages/employee/PulseCheckPage';

// IT Pages
import { ITDashboardPage } from './pages/it/ITDashboardPage';
import { TicketQueuePage } from './pages/it/TicketQueuePage';
import { AssetManagementPage } from './pages/it/AssetManagementPage';
import { OffboardingRisksPage } from './pages/it/OffboardingRisksPage';

// Admin & Governance Pages
import { RolesPolicyPage } from './pages/admin/RolesPolicyPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';

// Cross-Role Features
import { KnowledgeAssistantPage } from './pages/knowledge/KnowledgeAssistantPage';
import { CommunityHubPage } from './pages/community/CommunityHubPage';
import { DemoControlPage } from './pages/demo/DemoControlPage';
import { LoginPage } from './pages/auth/LoginPage';

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected App Layout */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/hr" replace />} />

          {/* HR Routes */}
          <Route path="hr" element={<HRDashboardPage />} />
          <Route path="hr/employees" element={<EmployeeListPage />} />
          <Route path="hr/employees/new" element={<CreateEmployeePage />} />
          <Route path="hr/employees/:id" element={<Navigate to="/employees/:id" replace />} />
          <Route path="hr/exceptions" element={<ExceptionCenterPage />} />

          {/* Employee Command Center & Sub-views */}
          <Route path="employees/:id" element={<EmployeeCommandCenterPage />} />
          <Route path="employees/:id/plan" element={<PlanDetailPage />} />
          <Route path="employees/:id/access" element={<AccessGraphPage />} />
          <Route path="employees/:id/provisioning" element={<ProvisioningPage />} />
          <Route path="employees/:id/timeline" element={<TimelinePage />} />
          <Route path="employees/:id/whatif" element={<WhatIfPage />} />
          <Route path="employees/:id/risk" element={<RiskReadinessPage />} />
          <Route path="employees/:id/transfer" element={<TransferPage />} />
          <Route path="employees/:id/offboarding" element={<OffboardingPage />} />
          <Route path="employees/:id/mentor" element={<MentorPage />} />
          <Route path="employees/:id/first-week" element={<FirstWeekPage />} />

          {/* Manager Routes */}
          <Route path="manager" element={<ManagerDashboardPage />} />
          <Route path="manager/approvals" element={<ApprovalQueuePage />} />
          <Route path="manager/approvals/:id" element={<ApprovalQueuePage />} />

          {/* Employee Self-Service Routes */}
          <Route path="me" element={<EmployeeDashboardPage />} />
          <Route path="me/tasks" element={<MyTasksPage />} />
          <Route path="me/assistant" element={<AIAssistantPage />} />
          <Route path="me/help" element={<HelpdeskPage />} />
          <Route path="me/first-week" element={<MyFirstWeekPage />} />
          <Route path="me/mentor" element={<MyMentorPage />} />
          <Route path="me/pulse" element={<PulseCheckPage />} />

          {/* IT Operations Routes */}
          <Route path="it" element={<ITDashboardPage />} />
          <Route path="it/tickets" element={<TicketQueuePage />} />
          <Route path="it/assets" element={<AssetManagementPage />} />
          <Route path="it/offboarding" element={<OffboardingRisksPage />} />

          {/* Admin & Governance Routes */}
          <Route path="admin/roles" element={<RolesPolicyPage />} />
          <Route path="admin/users" element={<UserManagementPage />} />

          {/* Cross-Role Routes */}
          <Route path="knowledge" element={<KnowledgeAssistantPage />} />
          <Route path="community" element={<CommunityHubPage />} />
          <Route path="_demo" element={<DemoControlPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/hr" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
