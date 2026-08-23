export interface AnalysisMetric {
  name: string;
  code: string;
  weight: number;
  score: number;
  preScore?: number;
  postScore?: number;
  diff?: string;
  description: string;
  category: 'efficiency' | 'quality' | 'collaboration';
}

export interface AnalysisSkill {
  name: string;
  rating: number;
  evidence: string;
  icon: string;
}

export interface AnalysisSimulation {
  name: string;
  score: number;
}

export interface AnalysisGap {
  name: string;
  current: number;
  target: number;
  gap: number;
  priority: 'High' | 'Medium' | 'Low';
  color: string;
}

export interface AnalysisRoadmapItem {
  num: number;
  title: string;
  desc: string;
  date: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface TargetRevisionItem {
  metric: string;
  previous: string;
  revised: string;
  timeline: string;
}

export interface PracticeModuleItem {
  id: string;
  title: string;
  duration: string;
  desc: string;
  category: string;
}

export interface EmployeeAnalysisProfile {
  key: string;
  id: string;
  name: string;
  role: string;
  department: string;
  joined: string;
  completedDate?: string;
  avatar: string;
  status: string;
  statusVariant: 'success' | 'warning' | 'info' | 'danger';
  overallScore: number;
  preScore: number;
  postScore: number;
  scoreDiff: string;
  readinessStatus: string;
  readinessLevel: string;
  isLowPerformance: boolean;
  metrics: AnalysisMetric[];
  skills: AnalysisSkill[];
  simulations: AnalysisSimulation[];
  gaps: AnalysisGap[];
  roadmap: AnalysisRoadmapItem[];
  targetRevisions: TargetRevisionItem[];
  practiceModules: PracticeModuleItem[];
}

export const ANALYSIS_EMPLOYEES: Record<string, EmployeeAnalysisProfile> = {
  rahul: {
    key: 'rahul',
    id: 'EMP10024',
    name: 'Rahul Sharma',
    role: 'Associate — Software Development',
    department: 'Engineering',
    joined: 'May 1, 2024',
    completedDate: 'Jul 1, 2024',
    avatar: 'RS',
    status: 'Onboarding Completed',
    statusVariant: 'success',
    overallScore: 81.0,
    preScore: 41.0,
    postScore: 75.5,
    scoreDiff: '+34.5',
    readinessStatus: 'Role Ready',
    readinessLevel: 'Good (75–89)',
    isLowPerformance: false,
    metrics: [
      { name: 'Task Completion', code: 'T', weight: 0.25, score: 85, preScore: 45, postScore: 85, diff: '+40.0', description: 'Core functional checklist and onboarding milestones completed', category: 'efficiency' },
      { name: 'Timeliness', code: 'D', weight: 0.20, score: 90, preScore: 50, postScore: 90, diff: '+40.0', description: 'On-time milestone submissions and proactive check-ins', category: 'efficiency' },
      { name: 'Quality / Accuracy', code: 'Q', weight: 0.20, score: 80, preScore: 40, postScore: 80, diff: '+40.0', description: 'Low rework rate and clean PR reviews in sandbox', category: 'quality' },
      { name: 'Onboarding Progress', code: 'P', weight: 0.15, score: 85, preScore: 35, postScore: 85, diff: '+50.0', description: 'System setup, learning path, and security modules completion', category: 'efficiency' },
      { name: 'Blocker Resolution', code: 'B', weight: 0.10, score: 90, preScore: 30, postScore: 90, diff: '+60.0', description: 'Autonomous troubleshooting and timely IT dependency escalation', category: 'quality' },
      { name: 'Learning & Resources', code: 'L', weight: 0.05, score: 85, preScore: 40, postScore: 85, diff: '+45.0', description: 'Completion of curated knowledge base materials', category: 'collaboration' },
      { name: 'Manager Feedback', code: 'M', weight: 0.05, score: 85, preScore: 50, postScore: 85, diff: '+35.0', description: 'Manager 1-on-1 qualitative evaluation and culture alignment', category: 'collaboration' },
    ],
    skills: [
      { name: 'Java Programming', rating: 4.5, evidence: 'Assessments, Projects', icon: '☕' },
      { name: 'Data Structures', rating: 4.0, evidence: 'Assessments', icon: '🧱' },
      { name: 'Problem Solving', rating: 4.0, evidence: 'Assessments', icon: '💡' },
      { name: 'REST API Integration', rating: 4.0, evidence: 'Projects, Tasks', icon: '🔌' },
      { name: 'Git & Version Control', rating: 3.5, evidence: 'Tasks, Simulations', icon: '🌿' },
      { name: 'SQL Basics', rating: 3.5, evidence: 'Assessments', icon: '🗄️' },
      { name: 'System Design Basics', rating: 3.0, evidence: 'Assessments', icon: '📐' },
      { name: 'Communication', rating: 4.0, evidence: 'Manager Feedback', icon: '💬' },
    ],
    simulations: [
      { name: 'Build REST API Service', score: 85 },
      { name: 'Debug Production Issue', score: 80 },
      { name: 'Database Query Optimization', score: 78 },
      { name: 'Code Refactoring Challenge', score: 88 },
      { name: 'UI Component Development', score: 75 },
      { name: 'System Design Scenario', score: 85 },
    ],
    gaps: [
      { name: 'System Design (Advanced)', current: 3.0, target: 4.5, gap: 1.5, priority: 'High', color: 'text-rose-600 bg-rose-50 border-rose-200' },
      { name: 'Performance Optimization', current: 3.0, target: 4.0, gap: 1.0, priority: 'High', color: 'text-rose-600 bg-rose-50 border-rose-200' },
      { name: 'Advanced SQL', current: 3.5, target: 4.5, gap: 1.0, priority: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
      { name: 'Security Best Practices', current: 3.0, target: 4.0, gap: 1.0, priority: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
      { name: 'Cloud Fundamentals', current: 2.5, target: 4.0, gap: 1.5, priority: 'Low', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    ],
    roadmap: [
      { num: 1, title: 'System Design Advanced', desc: 'Learn advanced design patterns and microservices architecture', date: 'Jul 15, 2024', priority: 'High' },
      { num: 2, title: 'Performance Optimization', desc: 'Hands-on practice with query profiling & indexing', date: 'Jul 31, 2024', priority: 'High' },
      { num: 3, title: 'Advanced SQL', desc: 'Complex joins, window functions and partitioning', date: 'Aug 15, 2024', priority: 'Medium' },
      { num: 4, title: 'Security Best Practices', desc: 'OWASP Top 10 mitigation and secure secrets storage', date: 'Aug 31, 2024', priority: 'Medium' },
    ],
    targetRevisions: [
      { metric: 'Task Completion', previous: '90%', revised: '85%', timeline: 'Completed' },
      { metric: 'Timeliness', previous: '90%', revised: '90%', timeline: 'On Track' },
      { metric: 'Quality / Accuracy', previous: '90%', revised: '80%', timeline: 'On Track' },
      { metric: 'Onboarding Progress', previous: '90%', revised: '85%', timeline: 'Completed' },
      { metric: 'Blocker Resolution', previous: '100%', revised: '90%', timeline: 'Completed' },
      { metric: 'Learning & Resources', previous: '100%', revised: '85%', timeline: 'Completed' },
    ],
    practiceModules: [
      { id: 'm1', title: 'Enterprise Clean Architecture', duration: '3 Modules (5 hrs)', desc: 'Hexagonal design, dependency injection & boundaries', category: 'architecture' },
      { id: 'm2', title: 'PostgreSQL Indexing & Optimization', duration: '2 Modules (4 hrs)', desc: 'Query plans, composite indexes & vacuuming', category: 'database' },
      { id: 'm3', title: 'Distributed Systems & Queues', duration: '4 Modules (6 hrs)', desc: 'Kafka, RabbitMQ & async transaction consistency', category: 'systems' },
    ],
  },

  amit: {
    key: 'amit',
    id: 'EMP10031',
    name: 'Amit Kumar',
    role: 'Associate — Frontend Developer',
    department: 'Frontend Eng',
    joined: 'May 1, 2024',
    avatar: 'AK',
    status: 'AI Recovery Plan Active',
    statusVariant: 'danger',
    overallScore: 48.5,
    preScore: 36.0,
    postScore: 48.5,
    scoreDiff: '+12.5',
    readinessStatus: 'At Risk (<60)',
    readinessLevel: 'Needs Improvement (<60)',
    isLowPerformance: true,
    metrics: [
      { name: 'Task Completion', code: 'T', weight: 0.25, score: 45, preScore: 30, postScore: 45, diff: '+15.0', description: 'Core functional checklist and onboarding milestones completed', category: 'efficiency' },
      { name: 'Timeliness', code: 'D', weight: 0.20, score: 50, preScore: 35, postScore: 50, diff: '+15.0', description: 'On-time milestone submissions and proactive check-ins', category: 'efficiency' },
      { name: 'Quality / Accuracy', code: 'Q', weight: 0.20, score: 40, preScore: 30, postScore: 40, diff: '+10.0', description: 'Low rework rate and clean PR reviews in sandbox', category: 'quality' },
      { name: 'Onboarding Progress', code: 'P', weight: 0.15, score: 55, preScore: 40, postScore: 55, diff: '+15.0', description: 'System setup, learning path, and security modules completion', category: 'efficiency' },
      { name: 'Blocker Resolution', code: 'B', weight: 0.10, score: 60, preScore: 50, postScore: 60, diff: '+10.0', description: 'Autonomous troubleshooting and timely IT dependency escalation', category: 'quality' },
      { name: 'Learning & Resources', code: 'L', weight: 0.05, score: 50, preScore: 40, postScore: 50, diff: '+10.0', description: 'Completion of curated knowledge base materials', category: 'collaboration' },
      { name: 'Manager Feedback', code: 'M', weight: 0.05, score: 50, preScore: 40, postScore: 50, diff: '+10.0', description: 'Manager 1-on-1 qualitative evaluation and culture alignment', category: 'collaboration' },
    ],
    skills: [
      { name: 'JavaScript ES6+', rating: 3.0, evidence: 'Code Reviews', icon: '🟨' },
      { name: 'React Components', rating: 3.0, evidence: 'Assignments', icon: '⚛️' },
      { name: 'HTML5 & CSS3', rating: 3.5, evidence: 'Assessments', icon: '🎨' },
      { name: 'Git Workflow', rating: 2.5, evidence: 'Simulations', icon: '🌿' },
      { name: 'Debugging & DevTools', rating: 2.5, evidence: 'Sandbox Logs', icon: '🐛' },
      { name: 'Communication', rating: 3.0, evidence: '1-on-1s', icon: '💬' },
    ],
    simulations: [
      { name: 'Build React UI Form', score: 52 },
      { name: 'Debug State Mutation', score: 45 },
      { name: 'CSS Grid Responsive Layout', score: 60 },
      { name: 'REST API Fetch & Catch', score: 48 },
    ],
    gaps: [
      { name: 'JavaScript Closures & Async', current: 2.5, target: 4.0, gap: 1.5, priority: 'High', color: 'text-rose-600 bg-rose-50 border-rose-200' },
      { name: 'State Management & Effects', current: 2.5, target: 4.0, gap: 1.5, priority: 'High', color: 'text-rose-600 bg-rose-50 border-rose-200' },
      { name: 'Code Quality & Clean PRs', current: 3.0, target: 4.0, gap: 1.0, priority: 'High', color: 'text-rose-600 bg-rose-50 border-rose-200' },
      { name: 'Git Conflict Resolution', current: 2.5, target: 3.5, gap: 1.0, priority: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    ],
    roadmap: [
      { num: 1, title: 'Strengthen JavaScript Fundamentals', desc: 'Variables, scopes, async/await and DOM', date: 'Next 2 Weeks', priority: 'High' },
      { num: 2, title: 'UI Development Practice', desc: 'Component composition & state debugging', date: 'Next 3 Weeks', priority: 'High' },
      { num: 3, title: 'Peer Mentor Pairing', desc: 'Two 1-on-1 code walkthroughs per week', date: 'Ongoing', priority: 'High' },
    ],
    targetRevisions: [
      { metric: 'Task Completion', previous: '90%', revised: '70%', timeline: 'Next 2 Weeks' },
      { metric: 'Timeliness (On-time Completion)', previous: '90%', revised: '75%', timeline: 'Next 2 Weeks' },
      { metric: 'Quality / Accuracy', previous: '90%', revised: '80%', timeline: 'Next 2 Weeks' },
      { metric: 'Onboarding Progress', previous: '90%', revised: '80%', timeline: 'Next 3 Weeks' },
      { metric: 'Blocker Resolution', previous: '100%', revised: '90%', timeline: 'Next 2 Weeks' },
      { metric: 'Learning & Resources', previous: '100%', revised: '80%', timeline: 'Next 2 Weeks' },
    ],
    practiceModules: [
      { id: 'js-fund', title: 'Strengthen JavaScript Fundamentals', duration: '3 Modules (6 hrs)', desc: 'Practice variables, functions, scopes & DOM', category: 'core' },
      { id: 'ui-dev', title: 'UI Development Practice', duration: '4 Projects (8 hrs)', desc: 'Build small UI components & responsive layouts', category: 'frontend' },
      { id: 'code-debug', title: 'Code Quality & Debugging', duration: '2 Modules (4 hrs)', desc: 'Best practices, debugging & clean code', category: 'quality' },
      { id: 'onboard-res', title: 'Onboarding Resources', duration: '5 Resources (2 hrs)', desc: 'Complete pending mandatory resources', category: 'resources' },
      { id: 'mentor-session', title: 'Mentor Sessions', duration: '2 Sessions (2 hrs)', desc: '1-on-1 sessions for guidance & feedback', category: 'mentorship' },
    ],
  },

  priya: {
    key: 'priya',
    id: 'EMP10029',
    name: 'Priya Mehta',
    role: 'Associate — QA & Automation',
    department: 'Quality Engineering',
    joined: 'May 1, 2024',
    completedDate: 'Jul 10, 2024',
    avatar: 'PM',
    status: 'Onboarding in Progress',
    statusVariant: 'info',
    overallScore: 74.0,
    preScore: 44.0,
    postScore: 74.0,
    scoreDiff: '+30.0',
    readinessStatus: 'Developing',
    readinessLevel: 'Developing (60–74)',
    isLowPerformance: false,
    metrics: [
      { name: 'Task Completion', code: 'T', weight: 0.25, score: 75, preScore: 45, postScore: 75, diff: '+30.0', description: 'Core functional checklist and onboarding milestones completed', category: 'efficiency' },
      { name: 'Timeliness', code: 'D', weight: 0.20, score: 80, preScore: 50, postScore: 80, diff: '+30.0', description: 'On-time milestone submissions and proactive check-ins', category: 'efficiency' },
      { name: 'Quality / Accuracy', code: 'Q', weight: 0.20, score: 70, preScore: 40, postScore: 70, diff: '+30.0', description: 'Low rework rate and clean test suites in CI', category: 'quality' },
      { name: 'Onboarding Progress', code: 'P', weight: 0.15, score: 75, preScore: 45, postScore: 75, diff: '+30.0', description: 'System setup, learning path, and test environments', category: 'efficiency' },
      { name: 'Blocker Resolution', code: 'B', weight: 0.10, score: 70, preScore: 40, postScore: 70, diff: '+30.0', description: 'Autonomous troubleshooting and timely IT dependency escalation', category: 'quality' },
      { name: 'Learning & Resources', code: 'L', weight: 0.05, score: 80, preScore: 45, postScore: 80, diff: '+35.0', description: 'Completion of curated knowledge base materials', category: 'collaboration' },
      { name: 'Manager Feedback', code: 'M', weight: 0.05, score: 75, preScore: 45, postScore: 75, diff: '+30.0', description: 'Manager 1-on-1 qualitative evaluation and culture alignment', category: 'collaboration' },
    ],
    skills: [
      { name: 'Playwright & Cypress', rating: 4.0, evidence: 'E2E Test Suites', icon: '🎭' },
      { name: 'TypeScript / JS', rating: 3.5, evidence: 'Assessments', icon: '🟦' },
      { name: 'API Test Automation', rating: 4.0, evidence: 'Postman & CI Runs', icon: '⚡' },
      { name: 'CI/CD Pipelines', rating: 3.0, evidence: 'GitHub Actions', icon: '🚀' },
      { name: 'Bug Documentation', rating: 4.0, evidence: 'Jira Reports', icon: '📝' },
    ],
    simulations: [
      { name: 'Write Playwright Regression Suite', score: 78 },
      { name: 'Automate REST Endpoint Validation', score: 82 },
      { name: 'Configure GitHub Actions CI Workflow', score: 70 },
      { name: 'Performance Load Testing with k6', score: 74 },
    ],
    gaps: [
      { name: 'CI/CD Pipeline Optimization', current: 3.0, target: 4.5, gap: 1.5, priority: 'High', color: 'text-rose-600 bg-rose-50 border-rose-200' },
      { name: 'k6 Performance Testing', current: 3.0, target: 4.0, gap: 1.0, priority: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
      { name: 'Security Vulnerability Scanning', current: 2.5, target: 3.5, gap: 1.0, priority: 'Low', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    ],
    roadmap: [
      { num: 1, title: 'Advanced CI Test Matrix', desc: 'Parallel test execution in GitHub Actions', date: 'Jul 20, 2024', priority: 'High' },
      { num: 2, title: 'Performance Benchmark Suites', desc: 'Stress testing API throughput with k6', date: 'Aug 05, 2024', priority: 'Medium' },
    ],
    targetRevisions: [
      { metric: 'Task Completion', previous: '90%', revised: '80%', timeline: 'Next 2 Weeks' },
      { metric: 'Timeliness', previous: '90%', revised: '85%', timeline: 'Next 2 Weeks' },
      { metric: 'Quality / Accuracy', previous: '90%', revised: '80%', timeline: 'Next 2 Weeks' },
      { metric: 'Onboarding Progress', previous: '90%', revised: '85%', timeline: 'Next 2 Weeks' },
      { metric: 'Blocker Resolution', previous: '100%', revised: '85%', timeline: 'Next 2 Weeks' },
      { metric: 'Learning & Resources', previous: '100%', revised: '85%', timeline: 'Next 2 Weeks' },
    ],
    practiceModules: [
      { id: 'p1', title: 'Playwright Component Testing', duration: '3 Modules (4 hrs)', desc: 'Modern component testing with visual regression', category: 'testing' },
      { id: 'p2', title: 'Load & Chaos Testing', duration: '2 Modules (3 hrs)', desc: 'Simulate packet drops and latency with k6', category: 'performance' },
    ],
  },

  sarah: {
    key: 'sarah',
    id: 'EMP10018',
    name: 'Sarah Jenkins',
    role: 'Lead Cloud Architect',
    department: 'Infrastructure',
    joined: 'Apr 15, 2024',
    completedDate: 'Jun 1, 2024',
    avatar: 'SJ',
    status: 'Onboarding Completed',
    statusVariant: 'success',
    overallScore: 92.5,
    preScore: 68.0,
    postScore: 92.5,
    scoreDiff: '+24.5',
    readinessStatus: 'Expert / Role Ready',
    readinessLevel: 'Expert (90+)',
    isLowPerformance: false,
    metrics: [
      { name: 'Task Completion', code: 'T', weight: 0.25, score: 95, preScore: 70, postScore: 95, diff: '+25.0', description: 'Cloud infrastructure rollout milestones', category: 'efficiency' },
      { name: 'Timeliness', code: 'D', weight: 0.20, score: 95, preScore: 75, postScore: 95, diff: '+20.0', description: 'Ahead of schedule AWS multi-region setup', category: 'efficiency' },
      { name: 'Quality / Accuracy', code: 'Q', weight: 0.20, score: 90, preScore: 65, postScore: 90, diff: '+25.0', description: 'Terraform IaC and zero security drift', category: 'quality' },
      { name: 'Onboarding Progress', code: 'P', weight: 0.15, score: 90, preScore: 65, postScore: 90, diff: '+25.0', description: 'IAM governance and compliance audits', category: 'efficiency' },
      { name: 'Blocker Resolution', code: 'B', weight: 0.10, score: 95, preScore: 60, postScore: 95, diff: '+35.0', description: 'VPC peering and cross-account access fix', category: 'quality' },
      { name: 'Learning & Resources', code: 'L', weight: 0.05, score: 90, preScore: 70, postScore: 90, diff: '+20.0', description: 'Company architecture playbook contribution', category: 'collaboration' },
      { name: 'Manager Feedback', code: 'M', weight: 0.05, score: 90, preScore: 65, postScore: 90, diff: '+25.0', description: 'Outstanding technical leadership', category: 'collaboration' },
    ],
    skills: [
      { name: 'AWS & Kubernetes', rating: 5.0, evidence: 'Terraform & EKS Setup', icon: '☁️' },
      { name: 'Terraform IaC', rating: 4.8, evidence: 'Infra Repository PRs', icon: '🏗️' },
      { name: 'Zero Trust Security', rating: 4.5, evidence: 'IAM Policy Audit', icon: '🛡️' },
      { name: 'Cost Optimization', rating: 4.5, evidence: 'AWS Cost Explorer', icon: '💰' },
    ],
    simulations: [
      { name: 'Multi-AZ Disaster Recovery Failover', score: 96 },
      { name: 'Kubernetes Cluster Hardening', score: 94 },
      { name: 'Zero-Downtime Database Migration', score: 90 },
    ],
    gaps: [
      { name: 'Internal FinOps Automation', current: 4.0, target: 5.0, gap: 1.0, priority: 'Low', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    ],
    roadmap: [
      { num: 1, title: 'Multi-Cloud Gateway Strategy', desc: 'Deploy hybrid mesh network with Consul', date: 'Jul 30, 2024', priority: 'Medium' },
    ],
    targetRevisions: [],
    practiceModules: [],
  },

  david: {
    key: 'david',
    id: 'EMP10035',
    name: 'David Miller',
    role: 'Staff DevOps Engineer',
    department: 'Platform',
    joined: 'May 10, 2024',
    avatar: 'DM',
    status: 'In Progress',
    statusVariant: 'info',
    overallScore: 78.5,
    preScore: 50.0,
    postScore: 78.5,
    scoreDiff: '+28.5',
    readinessStatus: 'Role Ready',
    readinessLevel: 'Good (75–89)',
    isLowPerformance: false,
    metrics: [
      { name: 'Task Completion', code: 'T', weight: 0.25, score: 80, preScore: 50, postScore: 80, diff: '+30.0', description: 'CI/CD pipeline and container registry migration', category: 'efficiency' },
      { name: 'Timeliness', code: 'D', weight: 0.20, score: 85, preScore: 55, postScore: 85, diff: '+30.0', description: 'Sprint delivery cadence', category: 'efficiency' },
      { name: 'Quality / Accuracy', code: 'Q', weight: 0.20, score: 75, preScore: 50, postScore: 75, diff: '+25.0', description: 'Helm charts and ArgoCD manifests', category: 'quality' },
      { name: 'Onboarding Progress', code: 'P', weight: 0.15, score: 80, preScore: 45, postScore: 80, diff: '+35.0', description: 'Security scanning integration in pipelines', category: 'efficiency' },
      { name: 'Blocker Resolution', code: 'B', weight: 0.10, score: 80, preScore: 50, postScore: 80, diff: '+30.0', description: 'Kubelet DNS issue resolution', category: 'quality' },
      { name: 'Learning & Resources', code: 'L', weight: 0.05, score: 75, preScore: 50, postScore: 75, diff: '+25.0', description: 'Platform engineering guidelines', category: 'collaboration' },
      { name: 'Manager Feedback', code: 'M', weight: 0.05, score: 75, preScore: 50, postScore: 75, diff: '+25.0', description: 'Strong collaboration with feature teams', category: 'collaboration' },
    ],
    skills: [
      { name: 'Kubernetes & Helm', rating: 4.2, evidence: 'ArgoCD Deployments', icon: '⚓' },
      { name: 'GitHub Actions & CI', rating: 4.5, evidence: 'Build Pipelines', icon: '⚙️' },
      { name: 'Prometheus & Grafana', rating: 3.8, evidence: 'Telemetry Dashboards', icon: '📈' },
    ],
    simulations: [
      { name: 'Canary Deployment with Istio', score: 82 },
      { name: 'Automated Vulnerability Scan Gate', score: 88 },
    ],
    gaps: [
      { name: 'eBPF Kernel Tracing', current: 2.5, target: 4.0, gap: 1.5, priority: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    ],
    roadmap: [
      { num: 1, title: 'eBPF Observability Rollout', desc: 'Deploy Cilium for low-overhead network metrics', date: 'Aug 10, 2024', priority: 'Medium' },
    ],
    targetRevisions: [],
    practiceModules: [],
  },

  elena: {
    key: 'elena',
    id: 'EMP10042',
    name: 'Elena Rostova',
    role: 'Product Security Engineer',
    department: 'Security',
    joined: 'May 15, 2024',
    avatar: 'ER',
    status: 'In Progress',
    statusVariant: 'info',
    overallScore: 84.0,
    preScore: 55.0,
    postScore: 84.0,
    scoreDiff: '+29.0',
    readinessStatus: 'Role Ready',
    readinessLevel: 'Good (75–89)',
    isLowPerformance: false,
    metrics: [
      { name: 'Task Completion', code: 'T', weight: 0.25, score: 85, preScore: 55, postScore: 85, diff: '+30.0', description: 'Threat modeling and SAST/DAST rollout', category: 'efficiency' },
      { name: 'Timeliness', code: 'D', weight: 0.20, score: 85, preScore: 60, postScore: 85, diff: '+25.0', description: 'Vulnerability triage within SLA', category: 'efficiency' },
      { name: 'Quality / Accuracy', code: 'Q', weight: 0.20, score: 85, preScore: 55, postScore: 85, diff: '+30.0', description: 'Accurate false-positive filtering', category: 'quality' },
      { name: 'Onboarding Progress', code: 'P', weight: 0.15, score: 85, preScore: 50, postScore: 85, diff: '+35.0', description: 'Security champion program setup', category: 'efficiency' },
      { name: 'Blocker Resolution', code: 'B', weight: 0.10, score: 85, preScore: 50, postScore: 85, diff: '+35.0', description: 'Secret leak remediation in legacy repos', category: 'quality' },
      { name: 'Learning & Resources', code: 'L', weight: 0.05, score: 80, preScore: 55, postScore: 80, diff: '+25.0', description: 'Secure coding checklist creation', category: 'collaboration' },
      { name: 'Manager Feedback', code: 'M', weight: 0.05, score: 80, preScore: 55, postScore: 80, diff: '+25.0', description: 'Excellent cross-team communication', category: 'collaboration' },
    ],
    skills: [
      { name: 'Threat Modeling (STRIDE)', rating: 4.5, evidence: 'Design Reviews', icon: '🔍' },
      { name: 'SAST / DAST Tools', rating: 4.2, evidence: 'SonarQube & Snyk', icon: '🛡️' },
      { name: 'Secrets Management', rating: 4.0, evidence: 'HashiCorp Vault', icon: '🔐' },
    ],
    simulations: [
      { name: 'Simulated API Token Leak Remediation', score: 92 },
      { name: 'SQL Injection Sandbox Defense', score: 90 },
    ],
    gaps: [
      { name: 'Cloud Security Posture (CSPM)', current: 3.5, target: 4.5, gap: 1.0, priority: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    ],
    roadmap: [
      { num: 1, title: 'Automated CSPM Audit', desc: 'Deploy automated CIS AWS Benchmark scanner', date: 'Aug 20, 2024', priority: 'Medium' },
    ],
    targetRevisions: [],
    practiceModules: [],
  },
};
