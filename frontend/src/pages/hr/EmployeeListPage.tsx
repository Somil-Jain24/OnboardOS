import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useEmployees } from '../../hooks/useOnboardOS';
import { UserPlus, ArrowRight, Search, SlidersHorizontal, Loader2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmployeeListPage() {
  const { employees, loading, error, refetch } = useEmployees();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.roleTitle.toLowerCase().includes(search.toLowerCase()) ||
      emp.departmentName.toLowerCase().includes(search.toLowerCase()) ||
      emp.teamName.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || emp.departmentName === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || emp.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const getStatusBadge = (empId: string, status: string) => {
    if (empId === 'emp-rahul') {
      return { label: 'Blocked (Jira 503)', variant: 'danger' as const };
    }
    if (status === 'ACTIVE') {
      return { label: 'Active', variant: 'success' as const };
    }
    if (status === 'INVITED') {
      return { label: 'Invited', variant: 'info' as const };
    }
    if (status === 'EXITING') {
      return { label: 'Exiting', variant: 'warning' as const };
    }
    return { label: status, variant: 'secondary' as const };
  };

  const getReadinessScore = (empId: string) => {
    if (empId === 'emp-rahul') return 65;
    if (empId === 'emp-priya') return 90;
    if (empId === 'emp-aman') return 100;
    return 80;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Directory"
        description="Comprehensive view of all active, invited, and transitioning employees with live context snapshots, readiness metrics, and risk status."
        badge={<Badge variant="default" dot>{employees.length} Total Employees</Badge>}
        actions={
          <Link to="/hr/employees/new">
            <Button leftIcon={<UserPlus className="w-4 h-4" />}>
              Create New Employee
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, department..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-9 px-3 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Human Resources">Human Resources</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-3 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INVITED">Invited</option>
            <option value="EXITING">Exiting</option>
          </select>
        </div>
      </div>

      {/* Employee List View */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-xs">Loading employee directory...</span>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 space-y-3">
          <Users className="w-10 h-10 mx-auto text-slate-600" />
          <h4 className="text-sm font-semibold text-slate-200">No employees match your search criteria</h4>
          <p className="text-xs max-w-sm mx-auto">
            Try adjusting your search terms or department filters to see active cohort members.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredEmployees.map((emp) => {
            const statusConfig = getStatusBadge(emp.id, emp.status);
            const readiness = getReadinessScore(emp.id);

            return (
              <Card
                key={emp.id}
                className="hover:border-slate-700 transition-all p-4 bg-slate-900/80"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <Avatar
                      name={emp.name}
                      size="md"
                      status={emp.id === 'emp-rahul' ? 'failed' : 'online'}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-100">{emp.name}</h3>
                        <Badge variant={statusConfig.variant} size="sm" dot>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {emp.roleTitle} • {emp.departmentName} ({emp.teamName}) •{' '}
                        <span className="font-mono text-slate-300">{emp.seniority}</span> •{' '}
                        Manager: <span className="text-slate-300">{emp.managerName || 'Marcus Vance'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono block">Day-1 Readiness</span>
                      <span
                        className={`text-sm font-bold font-mono ${
                          readiness >= 90
                            ? 'text-emerald-400'
                            : readiness >= 50
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {readiness}%
                      </span>
                    </div>
                    <Link to={`/employees/${emp.id}`}>
                      <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Command Center
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
