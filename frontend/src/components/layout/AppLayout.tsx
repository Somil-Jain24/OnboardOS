import { Outlet, useLocation, Link, Navigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { LiveActivityTicker } from './LiveActivityTicker';
import { useAuth } from '../../context/AuthContext';
import { useAIMode, AIWorkspace } from '../ai-workspace';
import { ChevronRight, Home } from 'lucide-react';

export function AppLayout() {
  const location = useLocation();
  const { currentRole, isEmployeeDetailOpen, isAuthenticated } = useAuth();
  const { isAIMode } = useAIMode();

  // If user is not authenticated, redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Generate breadcrumbs from path
  const pathParts = location.pathname.split('/').filter(Boolean);

  // Hide sidebar if in Employee role on /me root and haven't opened a specific profile
  const shouldHideSidebar =
    currentRole === 'EMPLOYEE' &&
    location.pathname === '/me' &&
    !isEmployeeDetailOpen;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans">
      <Navbar />
      <LiveActivityTicker />

      <div className="flex-1 flex overflow-hidden">
        {!shouldHideSidebar && <Sidebar />}

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F8FAFC]">
          {/* Breadcrumb Header */}
          {pathParts.length > 0 && (
            <div className="px-6 md:px-8 py-2.5 border-b border-slate-200/70 bg-white/70 backdrop-blur-xs flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Link to="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                <Home className="w-3.5 h-3.5 text-slate-400" />
                <span>OnboardOS</span>
              </Link>
              {pathParts.map((part, index) => {
                const url = `/${pathParts.slice(0, index + 1).join('/')}`;
                const isLast = index === pathParts.length - 1;

                return (
                  <div key={url} className="flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    {isLast ? (
                      <span className="text-slate-900 font-semibold capitalize">
                        {part.replace(/-/g, ' ')}
                      </span>
                    ) : (
                      <Link to={url} className="hover:text-blue-600 capitalize transition-colors">
                        {part.replace(/-/g, ' ')}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Page Content Container */}
          <div
            className={`flex-1 p-6 md:p-8 w-full mx-auto ${
              shouldHideSidebar ? 'max-w-[1700px]' : 'max-w-7xl'
            }`}
          >
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global AI Workspace Overlay & Interaction Mode */}
      {isAIMode && <AIWorkspace />}
    </div>
  );
}

export default AppLayout;
