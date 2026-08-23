import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckSquare,
  Clock,
  Target,
  FileCode,
  Users,
  Compass,
  Layers,
  ArrowRightLeft,
  ChevronDown,
  Search,
  Check,
  Calendar,
  Briefcase,
  Star,
  Award,
  Code2,
  AlertTriangle,
  Flame,
  CheckCheck,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';
import { ANALYSIS_EMPLOYEES, type EmployeeAnalysisProfile } from './analysisData';

export interface ProjectRequirement {
  id: string;
  title: string;
  roleTarget: string;
  department: string;
  priority: 'Urgent' | 'High Priority' | 'Standard';
  description: string;
  requiredSkills: {
    name: string;
    targetRating: number;
    weight: number;
    icon: string;
    // Candidate explicit ratings for this domain
    candidateRatings: Record<string, { rating: number; evidence: string }>;
  }[];
}

const PROJECT_REQUIREMENTS: ProjectRequirement[] = [
  {
    id: 'proj-backend-microservices',
    title: 'Enterprise Microservices & Cloud Platform',
    roleTarget: 'Backend Software Developer',
    department: 'Core Engineering',
    priority: 'High Priority',
    description: 'High-throughput microservices architecture migration requiring strong API design, Java/Node backend, and data structures.',
    requiredSkills: [
      {
        name: 'REST API & Microservices',
        targetRating: 4.5,
        weight: 0.30,
        icon: '🔌',
        candidateRatings: {
          rahul: { rating: 4.8, evidence: 'REST Gateway Module Complete (Zero Errors)' },
          priya: { rating: 3.8, evidence: 'Postman Integration Collection' },
          amit: { rating: 3.0, evidence: 'Basic Fetch API Endpoints' },
          sarah: { rating: 4.9, evidence: 'Enterprise Cloud API Gateway' },
          david: { rating: 4.0, evidence: 'Kubernetes Ingress Routes' },
          elena: { rating: 4.2, evidence: 'Secured Token Endpoints' },
        },
      },
      {
        name: 'Backend Architecture & Java',
        targetRating: 4.5,
        weight: 0.25,
        icon: '☕',
        candidateRatings: {
          rahul: { rating: 4.7, evidence: 'Clean Architecture PR #104' },
          priya: { rating: 3.5, evidence: 'Java Unit Testing' },
          amit: { rating: 2.8, evidence: 'Core Syntax Modules' },
          sarah: { rating: 4.8, evidence: 'Multi-service Distributed Mesh' },
          david: { rating: 3.8, evidence: 'Containerized Microservices' },
          elena: { rating: 4.0, evidence: 'Backend Data Encryption' },
        },
      },
      {
        name: 'Database & Data Structures',
        targetRating: 4.0,
        weight: 0.20,
        icon: '🗄️',
        candidateRatings: {
          rahul: { rating: 4.5, evidence: 'PostgreSQL Indexing Lab' },
          priya: { rating: 3.6, evidence: 'SQL Data Assertions' },
          amit: { rating: 3.2, evidence: 'Basic CRUD Schema' },
          sarah: { rating: 4.9, evidence: 'Multi-AZ Database Clustering' },
          david: { rating: 4.0, evidence: 'StatefulSet Deployments' },
          elena: { rating: 4.3, evidence: 'Encrypted DB Storage' },
        },
      },
      {
        name: 'Code Refactoring & Testing',
        targetRating: 4.0,
        weight: 0.15,
        icon: '🧪',
        candidateRatings: {
          rahul: { rating: 4.6, evidence: '88% Score in Code Refactor Challenge' },
          priya: { rating: 4.5, evidence: 'Comprehensive Unit Test Suites' },
          amit: { rating: 3.0, evidence: 'Manual Debugging Runs' },
          sarah: { rating: 4.7, evidence: 'Automated CI Quality Gates' },
          david: { rating: 4.2, evidence: 'SonarQube Quality Scan' },
          elena: { rating: 4.4, evidence: 'Static Code SAST Scans' },
        },
      },
      {
        name: 'System Design Fundamentals',
        targetRating: 4.0,
        weight: 0.10,
        icon: '📐',
        candidateRatings: {
          rahul: { rating: 4.4, evidence: 'System Design Scenario 85%' },
          priya: { rating: 3.2, evidence: 'Basic Component Diagram' },
          amit: { rating: 2.5, evidence: 'Intro Design Principles' },
          sarah: { rating: 5.0, evidence: 'Zero-Downtime Migration Architect' },
          david: { rating: 4.2, evidence: 'Helm Multi-Env Templates' },
          elena: { rating: 4.5, evidence: 'Threat Model Blueprint' },
        },
      },
    ],
  },
  {
    id: 'proj-qa-automation',
    title: 'QA Automation & Mission-Critical Release Testing',
    roleTarget: 'QA & Test Automation Specialist',
    department: 'Quality Engineering',
    priority: 'Urgent',
    description: 'Automated test suite creation, regression pipelines with Playwright/Cypress, and defect-prevention validation.',
    requiredSkills: [
      {
        name: 'Playwright & E2E Automation',
        targetRating: 4.6,
        weight: 0.35,
        icon: '🎭',
        candidateRatings: {
          rahul: { rating: 3.5, evidence: 'Basic Jest Component Tests' },
          priya: { rating: 4.9, evidence: 'Full Playwright Regression Suite' },
          amit: { rating: 2.6, evidence: 'Manual UI Click Testing' },
          sarah: { rating: 4.2, evidence: 'E2E CI Workflow Setup' },
          david: { rating: 3.8, evidence: 'Automated Headless Test Runner' },
          elena: { rating: 4.0, evidence: 'Security Test Regression' },
        },
      },
      {
        name: 'API Automation & Test Suites',
        targetRating: 4.5,
        weight: 0.25,
        icon: '⚡',
        candidateRatings: {
          rahul: { rating: 3.8, evidence: 'Swagger Endpoint Docs' },
          priya: { rating: 4.8, evidence: 'Automated Postman & Newman Runs' },
          amit: { rating: 2.8, evidence: 'Basic Fetch Calls' },
          sarah: { rating: 4.4, evidence: 'Synthetic API Health Monitors' },
          david: { rating: 4.0, evidence: 'API Load Ingress Testing' },
          elena: { rating: 4.3, evidence: 'Fuzz Testing on Auth Endpoints' },
        },
      },
      {
        name: 'Bug Triage & Defect Tracking',
        targetRating: 4.2,
        weight: 0.20,
        icon: '📝',
        candidateRatings: {
          rahul: { rating: 3.6, evidence: 'Standard Jira Tickets' },
          priya: { rating: 4.8, evidence: 'Zero False-Positive Bug Reports' },
          amit: { rating: 3.0, evidence: 'Informal Bug Notes' },
          sarah: { rating: 4.5, evidence: 'Root Cause Incident Analysis' },
          david: { rating: 4.0, evidence: 'Alerting & PagerDuty Integration' },
          elena: { rating: 4.6, evidence: 'CVSS Bug Severity Classification' },
        },
      },
      {
        name: 'CI/CD Test Matrix Integration',
        targetRating: 4.0,
        weight: 0.20,
        icon: '🚀',
        candidateRatings: {
          rahul: { rating: 3.4, evidence: 'GitHub Actions Push Triggers' },
          priya: { rating: 4.7, evidence: 'Parallel Multi-Browser CI Matrix' },
          amit: { rating: 2.5, evidence: 'Basic Git Workflow' },
          sarah: { rating: 4.9, evidence: 'Automated Staging Gateways' },
          david: { rating: 4.8, evidence: 'ArgoCD Deployment Testing' },
          elena: { rating: 4.2, evidence: 'Security Gate in Pipelines' },
        },
      },
    ],
  },
  {
    id: 'proj-frontend-design-system',
    title: 'Modern UI Design System & Web Accessibility',
    roleTarget: 'Frontend UI/UX Specialist',
    department: 'Product & Design',
    priority: 'Standard',
    description: 'Pixel-perfect component library, responsive layout engine, WCAG accessibility, and high-performance UI state.',
    requiredSkills: [
      {
        name: 'React Architecture & CSS Systems',
        targetRating: 4.6,
        weight: 0.35,
        icon: '⚛️',
        candidateRatings: {
          rahul: { rating: 3.8, evidence: 'Basic React Hooks & Forms' },
          priya: { rating: 4.7, evidence: 'CSS Grid, Tailwind & Theme Tokens' },
          amit: { rating: 3.4, evidence: 'UI Development Practice Labs' },
          sarah: { rating: 4.8, evidence: 'Component Library & Design Tokens' },
          david: { rating: 3.2, evidence: 'Admin Dashboard Layouts' },
          elena: { rating: 3.5, evidence: 'Accessible Security Modals' },
        },
      },
      {
        name: 'UI Quality & Cross-Browser QA',
        targetRating: 4.5,
        weight: 0.25,
        icon: '🎨',
        candidateRatings: {
          rahul: { rating: 3.5, evidence: 'Manual Browser Checks' },
          priya: { rating: 4.9, evidence: 'Visual Regression & Pixel QA' },
          amit: { rating: 3.2, evidence: 'Responsive Mobile Form Fixes' },
          sarah: { rating: 4.7, evidence: 'Cross-Platform Device Testing' },
          david: { rating: 3.5, evidence: 'Grafana Dashboard Styling' },
          elena: { rating: 3.8, evidence: 'Auth Dialog Accessibility' },
        },
      },
      {
        name: 'State Management & Performance',
        targetRating: 4.0,
        weight: 0.20,
        icon: '⚡',
        candidateRatings: {
          rahul: { rating: 4.0, evidence: 'Redux Sandbox Module' },
          priya: { rating: 4.6, evidence: 'Optimized Render Trees & Caching' },
          amit: { rating: 2.8, evidence: 'Component State Practice' },
          sarah: { rating: 4.9, evidence: 'React Query & Server State' },
          david: { rating: 3.6, evidence: 'Live WebSocket Dashboards' },
          elena: { rating: 3.8, evidence: 'Secure Session State' },
        },
      },
      {
        name: 'Web Accessibility & Semantic HTML',
        targetRating: 4.2,
        weight: 0.20,
        icon: '♿',
        candidateRatings: {
          rahul: { rating: 3.4, evidence: 'Standard HTML5 Elements' },
          priya: { rating: 4.8, evidence: 'WCAG AAA Contrast & ARIA Lab' },
          amit: { rating: 3.0, evidence: 'Basic Form Labels' },
          sarah: { rating: 4.7, evidence: 'Screen Reader Audited Layouts' },
          david: { rating: 3.0, evidence: 'Standard Tab Navigation' },
          elena: { rating: 4.2, evidence: 'Accessible CAPTCHA & Security' },
        },
      },
    ],
  },
  {
    id: 'proj-cloud-devops',
    title: 'Cloud Infrastructure & Kubernetes Security',
    roleTarget: 'DevOps & Infrastructure Engineer',
    department: 'Platform Engineering',
    priority: 'High Priority',
    description: 'Zero-trust infrastructure rollout, Kubernetes clusters, Helm charts, and continuous automated deployments.',
    requiredSkills: [
      {
        name: 'Kubernetes & Container Orchestration',
        targetRating: 4.8,
        weight: 0.35,
        icon: '☁️',
        candidateRatings: {
          rahul: { rating: 3.2, evidence: 'Docker Basics Course' },
          priya: { rating: 3.0, evidence: 'Test Container Running' },
          amit: { rating: 2.0, evidence: 'Basic CLI Commands' },
          sarah: { rating: 5.0, evidence: 'Production Multi-Cluster EKS' },
          david: { rating: 4.9, evidence: 'ArgoCD GitOps & Helm Deployments' },
          elena: { rating: 4.2, evidence: 'Container Image Security Scans' },
        },
      },
      {
        name: 'CI/CD Pipelines & Automation',
        targetRating: 4.5,
        weight: 0.25,
        icon: '⚙️',
        candidateRatings: {
          rahul: { rating: 3.5, evidence: 'GitHub Actions Build Setup' },
          priya: { rating: 3.8, evidence: 'Automated Test Matrix in CI' },
          amit: { rating: 2.5, evidence: 'Manual Trigger Workflows' },
          sarah: { rating: 4.9, evidence: 'Terraform Automated Pipelines' },
          david: { rating: 4.9, evidence: 'Zero-Downtime Canary Rollouts' },
          elena: { rating: 4.5, evidence: 'SAST/DAST Gate Integration' },
        },
      },
      {
        name: 'Observability & Monitoring',
        targetRating: 4.2,
        weight: 0.20,
        icon: '📈',
        candidateRatings: {
          rahul: { rating: 3.5, evidence: 'Basic Server Logs' },
          priya: { rating: 3.6, evidence: 'Test Run Telemetry' },
          amit: { rating: 2.5, evidence: 'Console Debugging' },
          sarah: { rating: 4.8, evidence: 'CloudWatch & OpenTelemetry Mesh' },
          david: { rating: 4.7, evidence: 'Prometheus AlertManager & Grafana' },
          elena: { rating: 4.4, evidence: 'Security Audit SIEM Feeds' },
        },
      },
      {
        name: 'Zero-Trust Network & Infrastructure',
        targetRating: 4.5,
        weight: 0.20,
        icon: '🛡️',
        candidateRatings: {
          rahul: { rating: 3.2, evidence: 'Basic HTTPS Endpoints' },
          priya: { rating: 3.0, evidence: 'VPN Environment Setup' },
          amit: { rating: 2.0, evidence: 'Password Policy Reading' },
          sarah: { rating: 5.0, evidence: 'Terraform IAM & VPC Architecture' },
          david: { rating: 4.5, evidence: 'mTLS Service Mesh with Istio' },
          elena: { rating: 4.8, evidence: 'HashiCorp Vault & RBAC Engine' },
        },
      },
    ],
  },
];

export const AIRoleRecommendationPage: React.FC = () => {
  const { currentRole } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-backend-microservices');
  const [candidateAKey, setCandidateAKey] = useState<string>('rahul');
  const [candidateBKey, setCandidateBKey] = useState<string>('priya');
  const [dropdownAOpen, setDropdownAOpen] = useState<boolean>(false);
  const [dropdownBOpen, setDropdownBOpen] = useState<boolean>(false);
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');
  const [assignedProject, setAssignedProject] = useState<string | null>(null);

  const currentProject =
    PROJECT_REQUIREMENTS.find((p) => p.id === selectedProjectId) || PROJECT_REQUIREMENTS[0];

  const allEmployees = Object.values(ANALYSIS_EMPLOYEES);
  const candidateA = ANALYSIS_EMPLOYEES[candidateAKey] || ANALYSIS_EMPLOYEES['rahul'];
  const candidateB = ANALYSIS_EMPLOYEES[candidateBKey] || ANALYSIS_EMPLOYEES['priya'];

  // 1. Calculate Outcome execution score for A and B
  const outcomeScoreA = Number(
    candidateA.metrics.reduce((acc, m) => acc + m.weight * m.score, 0).toFixed(1)
  );
  const outcomeScoreB = Number(
    candidateB.metrics.reduce((acc, m) => acc + m.weight * m.score, 0).toFixed(1)
  );

  // 2. Compute dynamic Skill Match Percentage for the active project
  const computeSkillMatch = (empKey: string) => {
    let earnedWeight = 0;
    let maxWeight = 0;

    currentProject.requiredSkills.forEach((req) => {
      const match = req.candidateRatings[empKey] || { rating: 3.2, evidence: 'Verified via Track' };
      const ratio = Math.min(1.0, match.rating / req.targetRating);
      earnedWeight += ratio * req.weight;
      maxWeight += req.weight;
    });

    return Number(((earnedWeight / maxWeight) * 100).toFixed(1));
  };

  const skillFitA = computeSkillMatch(candidateAKey);
  const skillFitB = computeSkillMatch(candidateBKey);

  // 3. Combined AI recommendation index = 50% Outcome Performance + 50% Skill Fit
  const combinedScoreA = Number(((outcomeScoreA * 0.5) + (skillFitA * 0.5)).toFixed(1));
  const combinedScoreB = Number(((outcomeScoreB * 0.5) + (skillFitB * 0.5)).toFixed(1));

  const isAWinner = combinedScoreA >= combinedScoreB;
  const winner = isAWinner ? candidateA : candidateB;
  const runnerUp = isAWinner ? candidateB : candidateA;
  const winnerCombined = isAWinner ? combinedScoreA : combinedScoreB;
  const runnerUpCombined = isAWinner ? combinedScoreB : combinedScoreA;
  const winnerSkillFit = isAWinner ? skillFitA : skillFitB;
  const winnerOutcome = isAWinner ? outcomeScoreA : outcomeScoreB;
  const scoreDiff = Number(Math.abs(combinedScoreA - combinedScoreB).toFixed(1));

  const filteredA = allEmployees.filter(
    (e) => e.name.toLowerCase().includes(searchA.toLowerCase()) || e.id.toLowerCase().includes(searchA.toLowerCase())
  );
  const filteredB = allEmployees.filter(
    (e) => e.name.toLowerCase().includes(searchB.toLowerCase()) || e.id.toLowerCase().includes(searchB.toLowerCase())
  );

  const getMetricIcon = (idx: number) => {
    switch (idx) {
      case 0: return <CheckSquare className="w-3.5 h-3.5 text-purple-600" />;
      case 1: return <Clock className="w-3.5 h-3.5 text-blue-600" />;
      case 2: return <Target className="w-3.5 h-3.5 text-amber-600" />;
      case 3: return <Layers className="w-3.5 h-3.5 text-indigo-600" />;
      case 4: return <Zap className="w-3.5 h-3.5 text-rose-600" />;
      case 5: return <FileCode className="w-3.5 h-3.5 text-cyan-600" />;
      default: return <Users className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  const handleAssign = () => {
    setAssignedProject(`"${currentProject.title}" successfully assigned to ${winner.name}!`);
    setTimeout(() => setAssignedProject(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              AI Role Recommendation
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium pl-11">
            Compare candidates on <strong className="text-slate-700">outcome performance</strong> AND <strong className="text-purple-700">specific project skill requirements</strong>.
          </p>
        </div>

        <div className="p-3 bg-purple-50/70 border border-purple-200/70 rounded-2xl flex items-center gap-2.5 text-xs text-purple-900 font-medium max-w-md">
          <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <span>
            Selecting different project roles dynamically changes the skill benchmarks and highlights the best candidate naturally.
          </span>
        </div>
      </div>

      {/* Target Project / Hiring Requirement Selector Bar (100% Pure White Theme) */}
      <div className="bg-white p-6 rounded-3xl text-slate-900 shadow-xs border border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                <Briefcase className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-700">
                Target Role / Project Requirement
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-50 text-purple-700 border border-purple-200">
                {currentProject.priority}
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 truncate">{currentProject.title}</h2>
            <p className="text-xs text-slate-500 max-w-2xl">{currentProject.description}</p>
          </div>

          {/* Project Switcher Select Menu */}
          <div className="flex-shrink-0 space-y-1">
            <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold">
              Switch Project to Test Fit:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-purple-400 cursor-pointer shadow-xs"
            >
              {PROJECT_REQUIREMENTS.map((proj) => (
                <option key={proj.id} value={proj.id} className="bg-white text-slate-900">
                  {proj.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Required Skills Chips */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 font-semibold">Required Benchmark:</span>
          {currentProject.requiredSkills.map((req, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-700"
            >
              <span>{req.icon}</span>
              <span>{req.name}</span>
              <span className="font-mono text-amber-600 font-bold">≥{req.targetRating}★</span>
              <span className="text-[10px] text-slate-400">({(req.weight * 100).toFixed(0)}%)</span>
            </span>
          ))}
        </div>
      </div>

      {/* Side-by-Side Candidates VS Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Candidate A Card */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 relative">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white text-lg font-black font-mono shadow-md shadow-emerald-500/20 flex-shrink-0">
              {candidateA.avatar}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider font-mono bg-emerald-100/70 px-1.5 py-0.2 rounded">
                  Candidate A
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {skillFitA}% Match
                </span>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 truncate">{candidateA.name}</h3>
              <p className="text-[11px] text-slate-500 truncate">{candidateA.role}</p>
              <p className="text-[10px] font-mono text-slate-400">Joined: {candidateA.joined}</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setDropdownAOpen((p) => !p);
                setDropdownBOpen(false);
              }}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <span>Change</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownAOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-2 space-y-2">
                <input
                  type="text"
                  value={searchA}
                  onChange={(e) => setSearchA(e.target.value)}
                  placeholder="Search candidate..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-900"
                />
                <div className="max-h-48 overflow-y-auto space-y-1 ai-scrollbar">
                  {filteredA.map((emp) => (
                    <button
                      key={emp.key}
                      onClick={() => {
                        setCandidateAKey(emp.key);
                        setDropdownAOpen(false);
                      }}
                      className={cn(
                        'w-full text-left p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer',
                        candidateAKey === emp.key ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      <div className="truncate">
                        <p className="font-bold truncate">{emp.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{emp.id}</p>
                      </div>
                      <span className="font-mono text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                        {computeSkillMatch(emp.key)}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* VS Badge */}
        <div className="lg:col-span-2 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-900 to-slate-800 text-white font-mono font-black text-xs flex items-center justify-center shadow-md border-2 border-white">
            VS
          </div>
        </div>

        {/* Candidate B Card */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 relative">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-black font-mono shadow-md shadow-blue-500/20 flex-shrink-0">
              {candidateB.avatar}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider font-mono bg-blue-100/70 px-1.5 py-0.2 rounded">
                  Candidate B
                </span>
                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                  {skillFitB}% Match
                </span>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 truncate">{candidateB.name}</h3>
              <p className="text-[11px] text-slate-500 truncate">{candidateB.role}</p>
              <p className="text-[10px] font-mono text-slate-400">Joined: {candidateB.joined}</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setDropdownBOpen((p) => !p);
                setDropdownAOpen(false);
              }}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <span>Change</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownBOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-2 space-y-2">
                <input
                  type="text"
                  value={searchB}
                  onChange={(e) => setSearchB(e.target.value)}
                  placeholder="Search candidate..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-900"
                />
                <div className="max-h-48 overflow-y-auto space-y-1 ai-scrollbar">
                  {filteredB.map((emp) => (
                    <button
                      key={emp.key}
                      onClick={() => {
                        setCandidateBKey(emp.key);
                        setDropdownBOpen(false);
                      }}
                      className={cn(
                        'w-full text-left p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer',
                        candidateBKey === emp.key ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      <div className="truncate">
                        <p className="font-bold truncate">{emp.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{emp.id}</p>
                      </div>
                      <span className="font-mono text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                        {computeSkillMatch(emp.key)}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Dual Comparison Tables & AI Recommendation Decision */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Dual Comparison Matrix (Skills + Outcomes) */}
        <div className="lg:col-span-8 space-y-5">
          {/* 1. Technical Skills Matrix for Selected Project */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h3 className="font-extrabold text-sm text-slate-900">
                    1. Verified Technical &amp; Role Skills Comparison
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Targeted benchmark ratings for &quot;{currentProject.title}&quot;
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono font-bold">
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  {candidateA.name.split(' ')[0]}: {skillFitA}% Match
                </span>
                <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                  {candidateB.name.split(' ')[0]}: {skillFitB}% Match
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                    <th className="px-3 py-2.5">Required Project Skill</th>
                    <th className="px-2 py-2.5 text-center">Req Target</th>
                    <th className="px-3 py-2.5 text-emerald-800">{candidateA.name.split(' ')[0]}&apos;s Rating</th>
                    <th className="px-3 py-2.5 text-blue-800">{candidateB.name.split(' ')[0]}&apos;s Rating</th>
                    <th className="px-2 py-2.5 text-center">Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {currentProject.requiredSkills.map((req, idx) => {
                    const matchA = req.candidateRatings[candidateAKey] || { rating: 3.2, evidence: 'Standard Track Evidence' };
                    const matchB = req.candidateRatings[candidateBKey] || { rating: 3.2, evidence: 'Standard Track Evidence' };

                    const diff = Number((matchA.rating - matchB.rating).toFixed(1));
                    const isAWinnerInSkill = matchA.rating >= matchB.rating;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-3 py-3 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{req.icon}</span>
                            <div>
                              <span className="block">{req.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono font-normal">
                                Weight: {(req.weight * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-2 py-3 text-center font-mono font-bold text-amber-600 bg-amber-50/50">
                          {req.targetRating}★
                        </td>

                        {/* Candidate A Rating & Evidence */}
                        <td className="px-3 py-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-emerald-700">{matchA.rating} / 5</span>
                              <span className={cn(
                                'text-[10px] font-mono px-1 rounded font-bold',
                                matchA.rating >= req.targetRating ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              )}>
                                {matchA.rating >= req.targetRating ? '✓ Met' : 'Under'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[150px]">
                              {matchA.evidence}
                            </span>
                          </div>
                        </td>

                        {/* Candidate B Rating & Evidence */}
                        <td className="px-3 py-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-blue-700">{matchB.rating} / 5</span>
                              <span className={cn(
                                'text-[10px] font-mono px-1 rounded font-bold',
                                matchB.rating >= req.targetRating ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                              )}>
                                {matchB.rating >= req.targetRating ? '✓ Met' : 'Under'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[150px]">
                              {matchB.evidence}
                            </span>
                          </div>
                        </td>

                        {/* Delta Advantage */}
                        <td className="px-2 py-3 text-center font-mono font-bold text-xs">
                          {diff === 0 ? (
                            <span className="text-slate-400">Equal</span>
                          ) : isAWinnerInSkill ? (
                            <span className="text-emerald-600">+{diff} ({candidateA.name.split(' ')[0]})</span>
                          ) : (
                            <span className="text-blue-600">+{Math.abs(diff)} ({candidateB.name.split(' ')[0]})</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  <tr className="bg-slate-50/90 font-bold border-t-2 border-slate-200">
                    <td colSpan={2} className="px-3 py-3.5 text-slate-900 font-black">
                      Overall Skill Requirement Match
                    </td>
                    <td className="px-3 py-3.5 font-mono font-black text-emerald-600 text-sm">
                      {skillFitA}%
                    </td>
                    <td className="px-3 py-3.5 font-mono font-black text-blue-600 text-sm">
                      {skillFitB}%
                    </td>
                    <td className="px-2 py-3.5 text-center font-mono font-black text-xs text-purple-700">
                      {skillFitA >= skillFitB
                        ? `+${(skillFitA - skillFitB).toFixed(1)}% (${candidateA.name.split(' ')[0]})`
                        : `+${(skillFitB - skillFitA).toFixed(1)}% (${candidateB.name.split(' ')[0]})`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Outcome-Based Performance Parameters Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">
                    2. Outcome-Based Performance Parameters
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Delivery reliability, timeliness &amp; quality across onboarding milestones
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl">
                Weight Total: 100%
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                    <th className="px-3 py-2.5">Evaluation Parameters (Outcome Based)</th>
                    <th className="px-2 py-2.5 text-center">Weight</th>
                    <th className="px-3 py-2.5 text-center text-emerald-800">{candidateA.name.split(' ')[0]}&apos;s Score (/100)</th>
                    <th className="px-3 py-2.5 text-center text-emerald-800">Weighted</th>
                    <th className="px-3 py-2.5 text-center text-blue-800">{candidateB.name.split(' ')[0]}&apos;s Score (/100)</th>
                    <th className="px-3 py-2.5 text-center text-blue-800">Weighted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {candidateA.metrics.map((m, idx) => {
                    const mB = candidateB.metrics[idx] || m;
                    const weightedA = (m.weight * m.score).toFixed(1);
                    const weightedB = (mB.weight * mB.score).toFixed(1);

                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-3 py-2.5 font-bold text-slate-900 flex items-center gap-2">
                          {getMetricIcon(idx)}
                          <div>
                            <span className="block">{m.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal truncate block max-w-[140px]">
                              {m.description}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono font-bold text-slate-500">
                          {(m.weight * 100).toFixed(0)}%
                        </td>

                        {/* Candidate A Score & Bar */}
                        <td className="px-3 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-mono font-bold text-emerald-700 w-6 text-right">{m.score}</span>
                            <div className="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${m.score}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-emerald-700">
                          {weightedA}
                        </td>

                        {/* Candidate B Score & Bar */}
                        <td className="px-3 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-mono font-bold text-blue-700 w-6 text-right">{mB.score}</span>
                            <div className="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${mB.score}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-blue-700">
                          {weightedB}
                        </td>
                      </tr>
                    );
                  })}

                  <tr className="bg-slate-50/90 font-bold border-t-2 border-slate-200">
                    <td colSpan={2} className="px-3 py-3 text-slate-900 font-black">
                      Total Outcome Score
                    </td>
                    <td colSpan={2} className="px-3 py-3 text-center font-mono font-black text-emerald-600 text-sm">
                      {outcomeScoreA} / 100
                    </td>
                    <td colSpan={2} className="px-3 py-3 text-center font-mono font-black text-blue-600 text-sm">
                      {outcomeScoreB} / 100
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Comprehensive AI Recommendation & Decision Card */}
        <div className="lg:col-span-4 space-y-4">
          {/* Winner AI Decision Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-700 font-extrabold text-xs uppercase tracking-wider font-mono">
                <Sparkles className="w-4 h-4" />
                <span>AI Recommendation</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                Outcome + Skills Match
              </span>
            </div>

            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-xs">
                  🏆
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider font-mono">
                    Recommended for Project
                  </span>
                  <h4 className="text-lg font-black text-emerald-950 leading-tight">
                    {winner.name}
                  </h4>
                </div>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 bg-white/80 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-500 font-mono">Role Skill Fit</span>
                  <p className="text-sm font-black text-emerald-700">{winnerSkillFit}%</p>
                </div>
                <div className="p-2 bg-white/80 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-500 font-mono">Outcome Score</span>
                  <p className="text-sm font-black text-emerald-700">{winnerOutcome}/100</p>
                </div>
              </div>

              <p className="text-xs text-emerald-900/90 leading-relaxed font-medium pt-1">
                {winner.name.split(' ')[0]} achieves the highest weighted composite score ({winnerCombined} pts) with <strong>{winnerSkillFit}% required skill alignment</strong> for &quot;{currentProject.title}&quot;.
              </p>
            </div>

            {/* Performance & Skill Difference Card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Overall AI Fit Advantage
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-600">+{scoreDiff}</span>
                <span className="text-xs font-bold text-slate-700">points in favor of {winner.name.split(' ')[0]}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, 50 + scoreDiff * 3)}%` }}
                />
              </div>
            </div>

            {/* Key Strengths & Fit Rationale */}
            <div className="space-y-2 pt-1">
              <h5 className="font-extrabold text-xs text-slate-900">Why {winner.name.split(' ')[0]} Wins This Assignment:</h5>
              <div className="space-y-1.5 text-[11px] text-slate-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Outperforms in specialized technical benchmarks</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Verified project artifacts and proven sandbox execution</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Higher delivery velocity and autonomous blocker resolution</span>
                </div>
              </div>
            </div>

            {/* Call to Action Card */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex items-start gap-2 text-xs text-amber-950 font-medium">
                <span className="text-base">🎯</span>
                <p className="leading-snug">
                  Assign <strong>{winner.name}</strong> to <strong>{currentProject.title}</strong>.
                </p>
              </div>
              <button
                onClick={handleAssign}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Assign {winner.name.split(' ')[0]} to Project</span>
              </button>
              {assignedProject && (
                <p className="text-[11px] text-center font-bold text-emerald-700 animate-in fade-in">
                  ✓ {assignedProject}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Formula & Calculation Transparency Footers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Outcome & Fit Formula Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider font-mono">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>How We Calculate Outcome-Based Parameters &amp; Role Fit</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
              100% Objective
            </span>
          </div>

          <div className="space-y-2">
            {/* Outcome Formula */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                1. Outcome Performance Score Formula (/100):
              </span>
              <div className="font-mono text-xs font-black text-slate-900 overflow-x-auto py-0.5">
                Outcome Score = (0.25 × T) + (0.20 × D) + (0.20 × Q) + (0.15 × P) + (0.10 × B) + (0.05 × L) + (0.05 × M)
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Live: {candidateA.name.split(' ')[0]} = <strong>{outcomeScoreA}/100</strong> | {candidateB.name.split(' ')[0]} = <strong>{outcomeScoreB}/100</strong>
              </p>
            </div>

            {/* Composite Fit Formula */}
            <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-purple-800 block">
                2. Final AI Composite Recommendation Index:
              </span>
              <div className="font-mono text-xs font-black text-purple-950 overflow-x-auto py-0.5">
                AI Fit Index = (0.50 × Skill Match %) + (0.50 × Outcome Performance Score)
              </div>
              <p className="text-[10px] text-purple-800 font-mono">
                Live: {candidateA.name.split(' ')[0]} = <strong>{combinedScoreA} pts</strong> | {candidateB.name.split(' ')[0]} = <strong>{combinedScoreB} pts</strong> (Winner: {winner.name.split(' ')[0]})
              </p>
            </div>
          </div>

          {/* Parameters legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-mono text-slate-600 pt-1">
            <span className="bg-slate-50 p-1.5 rounded-lg border border-slate-100"><strong>T (25%)</strong>: Task Comp.</span>
            <span className="bg-slate-50 p-1.5 rounded-lg border border-slate-100"><strong>D (20%)</strong>: Timeliness</span>
            <span className="bg-slate-50 p-1.5 rounded-lg border border-slate-100"><strong>Q (20%)</strong>: Quality</span>
            <span className="bg-slate-50 p-1.5 rounded-lg border border-slate-100"><strong>P (15%)</strong>: Progress</span>
            <span className="bg-slate-50 p-1.5 rounded-lg border border-slate-100"><strong>B (10%)</strong>: Blockers</span>
            <span className="bg-slate-50 p-1.5 rounded-lg border border-slate-100"><strong>L (5%)</strong>: Learning</span>
            <span className="bg-slate-50 p-1.5 rounded-lg border border-slate-100"><strong>M (5%)</strong>: Feedback</span>
            <span className="bg-purple-50 p-1.5 rounded-lg border border-purple-100 text-purple-800"><strong>Skills (50%)</strong>: Fit</span>
          </div>
        </div>

        {/* Anti Surveillance & Privacy Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>What We DO NOT Use for Performance Evaluation</span>
            </div>
            <p className="text-xs text-slate-500">
              Surveillance and micromanagement metrics are strictly excluded from all scores
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Login / Screen Time' },
              { label: 'Work Speed Rush' },
              { label: 'Mouse / Keyboard Logs' },
              { label: 'Hours Online' },
            ].map((item, i) => (
              <div key={i} className="p-2.5 bg-rose-50/50 rounded-xl border border-rose-100 text-center">
                <p className="text-[10px] font-bold text-slate-800 leading-tight">{item.label}</p>
                <span className="text-rose-500 font-bold text-xs">✕</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <p className="text-[11px] leading-snug">
              OnboardOS evaluates employees purely on <strong>verified deliverables</strong>, <strong>PR quality</strong>, and <strong>job requirement skills</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
