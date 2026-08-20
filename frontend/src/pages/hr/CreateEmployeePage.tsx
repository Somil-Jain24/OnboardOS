import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ReasoningSequence } from '../../components/ui/ReasoningSequence';
import { client } from '../../services';
import { Sparkles, ArrowRight, UserCheck, Shield, AlertCircle } from 'lucide-react';
import type { Employee } from '../../types';

export function CreateEmployeePage() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: 'Devin Larson',
    email: 'devin.larson@onboardos.internal',
    department: 'Engineering',
    roleTitle: 'Backend Developer',
    team: 'Payments Core',
    seniority: 'JUNIOR' as 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD',
    employmentType: 'FULL_TIME' as 'FULL_TIME' | 'CONTRACT' | 'INTERN',
    location: 'Bengaluru, India (Hybrid)',
    managerName: 'Marcus Vance',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const newEmp = await client.createEmployee({
        name: formData.name,
        email: formData.email,
        department: formData.department,
        roleTitle: formData.roleTitle,
        team: formData.team,
        seniority: formData.seniority,
        employmentType: formData.employmentType,
        location: formData.location,
        managerName: formData.managerName,
      });
      setCreatedEmployee(newEmp);
      setIsGenerating(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create employee');
    }
  };

  const handleReasoningComplete = () => {
    if (createdEmployee) {
      navigate(`/employees/${createdEmployee.id}/plan`);
    } else {
      navigate('/employees/emp-rahul/plan');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Onboard New Employee"
        description="Ingest employee work context to trigger deterministic policy resolution, immutable context snapshot capture, and AI requirement synthesis."
      />

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {isGenerating ? (
        <div className="space-y-4 animate-in fade-in duration-300">
          <ReasoningSequence
            onComplete={handleReasoningComplete}
            speedMs={500}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card className="space-y-6 p-6 bg-slate-900/90 border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-400" />
                Employee Work Context Snapshot (FR-CTX-01/02)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Context is stored immutably to preserve explainability even if role or team changes later.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  required
                />
                <Input
                  label="Corporate Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. rahul.sharma@internal.corp"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  options={[
                    { value: 'Engineering', label: 'Engineering' },
                    { value: 'Design', label: 'Design' },
                    { value: 'Human Resources', label: 'Human Resources' },
                    { value: 'Product', label: 'Product' },
                  ]}
                />
                <Select
                  label="Role Title"
                  value={formData.roleTitle}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                  options={[
                    { value: 'Backend Developer', label: 'Backend Developer' },
                    { value: 'Frontend Developer', label: 'Frontend Developer' },
                    { value: 'UI/UX Designer', label: 'UI/UX Designer' },
                    { value: 'HR Executive', label: 'HR Executive' },
                    { value: 'Security Engineer', label: 'Security Engineer' },
                  ]}
                />
                <Select
                  label="Seniority Band"
                  value={formData.seniority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seniority: e.target.value as 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD',
                    })
                  }
                  options={[
                    { value: 'JUNIOR', label: 'Junior / Associate (L1)' },
                    { value: 'MID', label: 'Mid-Level (L2)' },
                    { value: 'SENIOR', label: 'Senior (L3)' },
                    { value: 'LEAD', label: 'Staff / Lead (L4)' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Team / Pod Assignment"
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                  placeholder="e.g. Payments Core"
                  required
                />
                <Input
                  label="Reporting Manager"
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  placeholder="e.g. Marcus Vance"
                  required
                />
                <Select
                  label="Employment Type"
                  value={formData.employmentType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employmentType: e.target.value as 'FULL_TIME' | 'CONTRACT' | 'INTERN',
                    })
                  }
                  options={[
                    { value: 'FULL_TIME', label: 'Full-Time Employee' },
                    { value: 'CONTRACT', label: 'Contractor' },
                    { value: 'INTERN', label: 'Intern' },
                  ]}
                />
              </div>

              <Input
                label="Primary Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Bengaluru, India (Hybrid)"
              />
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                <Shield className="w-4 h-4 text-emerald-400" />
                Active Ruleset: v1.0.0 (Engineering Policy Active)
              </span>
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Sparkles className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Synthesize Personalized Plan
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
}
