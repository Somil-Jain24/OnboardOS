import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';
import { useEmployees } from '../../hooks/useOnboardOS';
import { UserPlus, ArrowRight, Search, Loader2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmployeeListPage() {
  const { employees, loading } = useEmployees();
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
      return { label: 'Blocked (Jira 503)', status: 'blocked' };
    }
    if (status === 'ACTIVE') {
      return { label: 'Active', status: 'completed' };
    }
    if (status === 'INVITED') {
      return { label: 'Invited', status: 'upcoming' };
    }
    if (status === 'EXITING') {
      return { label: 'Exiting', status: 'warning' };
    }
    return { label: status, status: 'pending' };
  };

  const getReadinessScore = (empId: string) => {
    if (empId === 'emp-rahul') return 65;
    if (empId === 'emp-priya') return 90;
    if (empId === 'emp-aman') return 100;
    return 80;
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Employee Directory"
        description="Comprehensive view of all active, invited, and transitioning employees with live context snapshots, readiness metrics, and risk status."
        badge={<Badge variant="default" dot>{employees.length} Total Employees</Badge>}
        actions={
          <Link to="/hr/employees/new">
            <Button variant="primary" leftIcon={<UserPlus className="w-4 h-4" />}>
              Create New Employee
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, department..."
            className="w-full h-10 pl-10 pr-3.5 text-xs md:text-sm bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-10 px-3.5 text-xs font-semibold bg-white border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Human Resources">Human Resources</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 px-3.5 text-xs font-semibold bg-white border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs cursor-pointer"
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
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs">Loading employee directory...</span>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="p-12 text-center text-slate-400 space-y-3 bg-white border border-slate-200 rounded-3xl shadow-card">
          <Users className="w-10 h-10 mx-auto text-slate-300" />
          <h4 className="text-sm font-bold text-slate-700">No employees match your search criteria</h4>
          <p className="text-xs max-w-sm mx-auto text-slate-500">
            Try adjusting your search terms or department filters to see active cohort members.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEmployees.map((emp) => {
            const statusConfig = getStatusBadge(emp.id, emp.status);
            const readiness = getReadinessScore(emp.id);

            return (
              <div
                key={emp.id}
                className="p-5 bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl shadow-card transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar
                      name={emp.name}
                      size="md"
                      status={emp.id === 'emp-rahul' ? 'failed' : 'online'}
                    />
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900">{emp.name}</h3>
                        <StatusBadge status={statusConfig.status} label={statusConfig.label} size="sm" showIcon />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {emp.roleTitle} • {emp.departmentName} ({emp.teamName}) •{' '}
                        <span className="font-mono text-slate-700 font-semibold">{emp.seniority}</span> •{' '}
                        Manager: <span className="text-slate-800 font-medium">{emp.managerName || 'Marcus Vance'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Day-1 Readiness</span>
                      <span
                        className={`text-sm font-bold font-mono ${
                          readiness >= 90
                            ? 'text-emerald-600'
                            : readiness >= 50
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {readiness}%
                      </span>
                    </div>
                    <Link to={`/employees/${emp.id}`}>
                      <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5 text-slate-600" />}>
                        Command Center
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

