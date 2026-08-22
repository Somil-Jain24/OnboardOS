import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AIModeProvider, AITransitionOverlay } from './components/ai-workspace';
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
import { FirstWeekSchedulePage } from './pages/employee/FirstWeekSchedulePage';
import { InternalTransferPage } from './pages/employee/InternalTransferPage';

// IT Pages
import { ITDashboardPage } from './pages/it/ITDashboardPage';
import { TicketQueuePage } from './pages/it/TicketQueuePage';
import { AssetManagementPage } from './pages/it/AssetManagementPage';
import { OffboardingRisksPage } from './pages/it/OffboardingRisksPage';

// Admin & Policy Pages
import { BirthrightPolicyPage } from './pages/admin/BirthrightPolicyPage';
import { RolesPolicyPage } from './pages/admin/RolesPolicyPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';

import { KnowledgeAssistantPage } from './pages/knowledge/KnowledgeAssistantPage';
import { DemoControlPage } from './pages/demo/DemoControlPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ActivateAccountPage } from './pages/auth/ActivateAccountPage';
import { AuthCallbackPage } from './pages/auth/AuthCallbackPage';
import { AccessMarketplacePage } from './pages/admin/AccessMarketplacePage';
import { RoleHomeRedirect, RoleRoute } from './components/auth/RoleRoute';

// Subroute Redirector Component
function EmployeeSubrouteRedirect({ tab }: { tab: string }) {
  const { id = 'emp-rahul' } = useParams();
  return <Navigate to={`/employees/${id}?tab=${tab}`} replace />;
}

export function App() {
  return (
    <AuthProvider>
      <AIModeProvider>
        <AITransitionOverlay />
        <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/activate" element={<ActivateAccountPage />} />
        <Route path="/activate/:token" element={<ActivateAccountPage />} />
        <Route path="/employee" element={<RoleRoute allowed={['EMPLOYEE']}><Navigate to="/me" replace /></RoleRoute>} />

        {/* Protected App Layout */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<RoleHomeRedirect />} />

          {/* HR Core Routes */}
          <Route path="hr" element={<RoleRoute allowed={['HR']}><HRDashboardPage /></RoleRoute>} />
          <Route path="hr/employees" element={<RoleRoute allowed={['HR']}><EmployeeListPage /></RoleRoute>} />
          <Route path="hr/employees/new" element={<RoleRoute allowed={['HR']}><CreateEmployeePage /></RoleRoute>} />
          <Route path="hr/offboarding" element={<RoleRoute allowed={['HR']}><HROffboardingPage /></RoleRoute>} />
          <Route path="hr/employees/:id" element={<RoleRoute allowed={['HR']}><Navigate to="/employees/:id" replace /></RoleRoute>} />
          <Route path="hr/exceptions" element={<RoleRoute allowed={['HR']}><ExceptionCenterPage /></RoleRoute>} />

          {/* Unified Employee Command Center */}
          <Route path="employees/:id" element={<RoleRoute allowed={['HR', 'MANAGER', 'IT']}><EmployeeCommandCenterPage /></RoleRoute>} />
          <Route path="employees/:id/plan" element={<RoleRoute allowed={['HR', 'MANAGER', 'IT']}><EmployeeSubrouteRedirect tab="access" /></RoleRoute>} />
          <Route path="employees/:id/access" element={<RoleRoute allowed={['HR', 'MANAGER', 'IT']}><EmployeeSubrouteRedirect tab="access" /></RoleRoute>} />
          <Route path="employees/:id/provisioning" element={<RoleRoute allowed={['HR', 'IT']}><EmployeeSubrouteRedirect tab="access" /></RoleRoute>} />
          <Route path="employees/:id/timeline" element={<RoleRoute allowed={['HR', 'MANAGER', 'IT']}><EmployeeSubrouteRedirect tab="activity" /></RoleRoute>} />
          <Route path="employees/:id/risk" element={<RoleRoute allowed={['HR', 'MANAGER']}><EmployeeSubrouteRedirect tab="overview" /></RoleRoute>} />
          <Route path="employees/:id/tasks" element={<RoleRoute allowed={['HR', 'MANAGER', 'IT']}><EmployeeSubrouteRedirect tab="tasks" /></RoleRoute>} />
          <Route path="employees/:id/first-week" element={<RoleRoute allowed={['HR', 'MANAGER']}><EmployeeSubrouteRedirect tab="tasks" /></RoleRoute>} />
          <Route path="employees/:id/offboarding" element={<RoleRoute allowed={['HR', 'IT']}><EmployeeSubrouteRedirect tab="activity" /></RoleRoute>} />
          <Route path="employees/:id/mentor" element={<RoleRoute allowed={['HR', 'MANAGER']}><EmployeeSubrouteRedirect tab="overview" /></RoleRoute>} />
          <Route path="employees/:id/whatif" element={<RoleRoute allowed={['HR']}><EmployeeSubrouteRedirect tab="access" /></RoleRoute>} />
          <Route path="employees/:id/transfer" element={<RoleRoute allowed={['HR']}><EmployeeSubrouteRedirect tab="activity" /></RoleRoute>} />

          {/* Manager Routes */}
          <Route path="manager" element={<RoleRoute allowed={['MANAGER']}><ManagerDashboardPage /></RoleRoute>} />
          <Route path="manager/approvals" element={<RoleRoute allowed={['MANAGER']}><ApprovalQueuePage /></RoleRoute>} />
          <Route path="manager/approvals/:id" element={<RoleRoute allowed={['MANAGER']}><ApprovalQueuePage /></RoleRoute>} />

          {/* Employee Self-Service Routes */}
          <Route path="me" element={<RoleRoute allowed={['EMPLOYEE']}><EmployeeDashboardPage /></RoleRoute>} />
          <Route path="me/tasks" element={<RoleRoute allowed={['EMPLOYEE']}><MyTasksPage /></RoleRoute>} />
          <Route path="me/assistant" element={<RoleRoute allowed={['EMPLOYEE']}><AIAssistantPage /></RoleRoute>} />
          <Route path="me/help" element={<RoleRoute allowed={['EMPLOYEE']}><HelpdeskPage /></RoleRoute>} />
          <Route path="me/marketplace" element={<RoleRoute allowed={['EMPLOYEE']}><AccessMarketplacePage /></RoleRoute>} />
          <Route path="me/first-week" element={<RoleRoute allowed={['EMPLOYEE']}><FirstWeekSchedulePage /></RoleRoute>} />
          <Route path="me/transfer" element={<RoleRoute allowed={['EMPLOYEE']}><InternalTransferPage /></RoleRoute>} />
          <Route path="me/mentor" element={<RoleRoute allowed={['EMPLOYEE']}><FirstWeekSchedulePage /></RoleRoute>} />
          <Route path="me/pulse" element={<RoleRoute allowed={['EMPLOYEE']}><Navigate to="/me" replace /></RoleRoute>} />

          {/* IT Operations Routes */}
          <Route path="it" element={<RoleRoute allowed={['IT']}><ITDashboardPage /></RoleRoute>} />
          <Route path="it/tickets" element={<RoleRoute allowed={['IT']}><TicketQueuePage /></RoleRoute>} />
          <Route path="it/assets" element={<RoleRoute allowed={['IT']}><AssetManagementPage /></RoleRoute>} />
          <Route path="it/offboarding" element={<RoleRoute allowed={['IT']}><OffboardingRisksPage /></RoleRoute>} />

          {/* Admin Policy & RBAC Routes */}
          <Route path="admin" element={<RoleRoute allowed={['ADMIN']}><Navigate to="/admin/birthright" replace /></RoleRoute>} />
          <Route path="admin/birthright" element={<RoleRoute allowed={['ADMIN']}><BirthrightPolicyPage /></RoleRoute>} />
          <Route path="admin/roles" element={<RoleRoute allowed={['ADMIN']}><RolesPolicyPage /></RoleRoute>} />
          <Route path="admin/users" element={<RoleRoute allowed={['ADMIN']}><UserManagementPage /></RoleRoute>} />
          <Route path="admin/marketplace" element={<RoleRoute allowed={['ADMIN']}><AccessMarketplacePage /></RoleRoute>} />

          {/* Cross-Role Knowledge & Demo */}
          <Route path="knowledge" element={<KnowledgeAssistantPage />} />
          <Route path="_demo" element={<RoleRoute allowed={['ADMIN']}><DemoControlPage /></RoleRoute>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<RoleHomeRedirect />} />
      </Routes>
      </AIModeProvider>
    </AuthProvider>
  );
}

export default App;
