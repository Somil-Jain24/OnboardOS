import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { SEEDED_USERS, useAuth } from '../../context/AuthContext';
import { Users, Shield, ArrowRight } from 'lucide-react';

export function UserManagementPage() {
  const { currentRole, switchRole } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="User & Role Administration"
        description="Manage identity accounts, role mappings, and administrative privileges across OnboardOS."
        badge={<Badge variant="default" dot>{SEEDED_USERS.length} Configured Users</Badge>}
      />

      <div className="space-y-3">
        {SEEDED_USERS.map((u) => (
          <Card key={u.id} className="p-4 bg-slate-900/80 border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Avatar name={u.name} size="md" status={currentRole === u.role ? 'online' : 'offline'} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-100">{u.name}</span>
                  <Badge variant={u.role === 'ADMIN' ? 'purple' : u.role === 'HR' ? 'info' : 'secondary'} size="sm">
                    {u.role}
                  </Badge>
                </div>
                <span className="text-slate-400 text-[11px] font-mono">{u.email}</span>
              </div>
            </div>

            <Button
              size="sm"
              variant={currentRole === u.role ? 'primary' : 'outline'}
              onClick={() => switchRole(u.role)}
            >
              {currentRole === u.role ? 'Active Persona' : 'Impersonate'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
