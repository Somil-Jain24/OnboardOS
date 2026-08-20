import { Outlet, useLocation, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ChevronRight, Home } from 'lucide-react';

export function AppLayout() {
  const location = useLocation();

  // Generate breadcrumbs from path
  const pathParts = location.pathname.split('/').filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-950/40">
          {/* Breadcrumb Header */}
          {pathParts.length > 0 && (
            <div className="px-6 py-2.5 border-b border-slate-800/40 bg-slate-950/20 flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Link to="/" className="hover:text-slate-200 flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                <span>OnboardOS</span>
              </Link>
              {pathParts.map((part, index) => {
                const url = `/${pathParts.slice(0, index + 1).join('/')}`;
                const isLast = index === pathParts.length - 1;

                return (
                  <div key={url} className="flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    {isLast ? (
                      <span className="text-slate-200 font-medium capitalize">
                        {part.replace(/-/g, ' ')}
                      </span>
                    ) : (
                      <Link to={url} className="hover:text-slate-200 capitalize">
                        {part.replace(/-/g, ' ')}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Page Content */}
          <div className="flex-1 p-6 max-w-7xl w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
