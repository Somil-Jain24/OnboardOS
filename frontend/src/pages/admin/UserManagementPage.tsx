import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';
import { SEEDED_USERS, useAuth } from '../../context/AuthContext';

export function UserManagementPage() {
  const { currentRole } = useAuth();

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="User & Role Administration"
        description="Manage identity accounts, role mappings, and administrative privileges across OnboardOS."
        badge={<Badge variant="default" dot>{SEEDED_USERS.length} Configured Users</Badge>}
      />

      <div className="space-y-3">
        {SEEDED_USERS.map((u) => (
          <div
            key={u.id}
            className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-card flex items-center justify-between text-xs transition-all hover:shadow-dropdown"
          >
            <div className="flex items-center gap-3.5">
              <Avatar name={u.name} size="md" status={currentRole === u.role ? 'online' : 'offline'} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{u.name}</span>
                  <Badge variant={u.role === 'ADMIN' ? 'purple' : u.role === 'HR' ? 'info' : 'secondary'} size="sm">
                    {u.role}
                  </Badge>
                </div>
                <span className="text-slate-500 text-xs font-mono">{u.email}</span>
              </div>
            </div>

            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${currentRole === u.role ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
              {currentRole === u.role ? 'Current signed-in role' : 'Sign in as this account'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

