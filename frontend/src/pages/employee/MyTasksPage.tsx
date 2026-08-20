import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useEmployee } from '../../hooks/useOnboardOS';
import { client } from '../../services';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  Search,
  CheckSquare,
  HelpCircle,
  Sparkles,
  BookOpen,
  X,
  Award,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Task } from '../../types';

export function MyTasksPage() {
  const { tasks, employee, refetch } = useEmployee('emp-rahul');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Training Modules
  const trainingModules = [
    {
      id: 'train-soc2',
      title: 'SOC 2 Type II Security Awareness & Least-Privilege Hygiene',
      description: 'Mandatory annual training covering password managers, phishing defense, and 2FA key management.',
      slides: [
        {
          title: 'Module 1: Password & Credential Security',
          content:
            'Never share credentials or store plaintext API keys in git repositories. All team members must enforce hardware-backed 2FA security keys (YubiKey or Google Titan) for GitHub and AWS Console logins.',
        },
        {
          title: 'Module 2: Phishing & Social Engineering Defense',
          content:
            'Be vigilant of urgent emails requesting gift cards, wire transfers, or immediate password resets. Always inspect the sender domain and report suspicious Slack/Email messages to #sec-ops immediately.',
        },
        {
          title: 'Module 3: Data Protection & Customer PII',
          content:
            'Never export raw customer payment logs or production database dumps to local storage or unapproved personal devices. Production queries must go through audited bastion hosts with JIT approval.',
        },
      ],
      quiz: {
        question: 'Which of the following is strictly prohibited when handling production infrastructure?',
        options: [
          'Requesting time-bound JIT elevation with an incident ticket number',
          'Exporting raw customer cardholder data to a local unencrypted laptop drive',
          'Enforcing hardware 2FA for AWS and GitHub logins',
        ],
        correct: 1,
      },
    },
    {
      id: 'train-gdpr',
      title: 'GDPR & CCPA Data Privacy Principles',
      description: 'Essential compliance guidelines for data retention, right-to-be-forgotten requests, and anonymization.',
      slides: [
        {
          title: 'Module 1: Principles of Data Minimization',
          content:
            'Only collect and store customer telemetry that is strictly required for application performance and billing compliance.',
        },
        {
          title: 'Module 2: Customer Data Deletion & Privacy Rights',
          content:
            'Under GDPR Article 17, customers have the right to request deletion of their personal identity records within 30 days of filing.',
        },
      ],
      quiz: {
        question: 'What is the standard SLA for honoring GDPR Data Subject Access & Erasure Requests?',
        options: ['Within 30 Calendar Days', 'Within 1 Year', 'Requests can be ignored if archived'],
        correct: 0,
      },
    },
  ];

  // TASK-184 Training Modal State
  const [activeTrainingModal, setActiveTrainingModal] = useState<
    (typeof trainingModules)[0] | null
  >(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [signedAcknowledge, setSignedAcknowledge] = useState(false);
  const [completedTrainings, setCompletedTrainings] = useState<string[]>([]);

  const categories = ['ALL', 'Identity', 'Communication', 'Development', 'Training', 'Cloud'];

  const filteredTasks =
    activeCategory === 'ALL'
      ? tasks
      : tasks.filter((t) => t.category === activeCategory);

  const handleCompleteTraining = async () => {
    if (!activeTrainingModal) return;
    setCompletedTrainings((prev) => [...prev, activeTrainingModal.id]);
    setActiveTrainingModal(null);
    setCurrentSlide(0);
    setQuizAnswer(null);
    setSignedAcknowledge(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Onboarding Tasks"
        description="Track and complete your Day-1 setup requirements, hardware receipts, access requests, and compliance trainings."
        badge={
          <Badge variant="default" dot>
            {tasks.filter((t) => t.status === 'COMPLETED').length + completedTrainings.length} Completed
          </Badge>
        }
        actions={
          <Link to="/employee/helpdesk">
            <Button size="sm" variant="outline" leftIcon={<HelpCircle className="w-3.5 h-3.5" />}>
              Need Help? Open Ticket
            </Button>
          </Link>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Interactive Compliance Trainings Section */}
      {(activeCategory === 'ALL' || activeCategory === 'Training') && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pt-1 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Required Compliance & Security Trainings</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {trainingModules.map((module) => {
              const isCompleted = completedTrainings.includes(module.id);

              return (
                <Card
                  key={module.id}
                  className={`p-4 border transition-all space-y-3 ${
                    isCompleted
                      ? 'bg-emerald-950/15 border-emerald-500/30'
                      : 'bg-slate-900/90 border-slate-800 hover:border-blue-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-100 text-xs">{module.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{module.description}</p>
                    </div>
                    {isCompleted ? (
                      <Badge variant="success" size="sm" className="flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Certified
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm" className="flex-shrink-0">
                        Required
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-[11px] text-slate-500 font-mono">3 Modules • 5 min Quiz</span>
                    <Button
                      size="sm"
                      variant={isCompleted ? 'outline' : 'primary'}
                      onClick={() => {
                        setActiveTrainingModal(module);
                        setCurrentSlide(0);
                        setQuizAnswer(null);
                        setSignedAcknowledge(false);
                      }}
                      className="text-xs h-7"
                    >
                      {isCompleted ? 'Review Content' : 'Launch Training Course'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pt-1 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          <span>Provisioning & System Setup Checklist</span>
        </div>

        {filteredTasks.map((t, idx) => {
          const isDone = t.status === 'COMPLETED';
          const isFailed = t.status === 'FAILED';
          const isBlocked = t.status === 'BLOCKED';
          const isWaiting = t.status === 'WAITING_APPROVAL';

          return (
            <Card
              key={t.id}
              className={`p-4 transition-all border ${
                isDone
                  ? 'bg-slate-900/60 border-slate-800'
                  : isFailed
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : isWaiting
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : isFailed ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  ) : isBlocked ? (
                    <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}

                  <div>
                    <span className={`font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                      {t.name}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>Category: {t.category}</span>
                      <span>•</span>
                      <span>Adapter: <code className="text-slate-300 font-mono">{t.adapterType}</code></span>
                    </div>
                  </div>
                </div>

                <Badge
                  variant={
                    isDone ? 'success' : isFailed ? 'danger' : isBlocked ? 'muted' : 'warning'
                  }
                  size="sm"
                >
                  {isDone
                    ? 'Granted'
                    : isFailed
                    ? 'IT Provisioning Error'
                    : isBlocked
                    ? 'Blocked on Upstream'
                    : 'Pending Setup'}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>

      {/* TASK-184: Interactive Training Course Modal */}
      {activeTrainingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-xl w-full p-6 bg-slate-900 border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{activeTrainingModal.title}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Step {currentSlide + 1} of {activeTrainingModal.slides.length + 1}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveTrainingModal(null)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slide Content View */}
            {currentSlide < activeTrainingModal.slides.length ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <h4 className="font-bold text-blue-300 text-sm">
                    {activeTrainingModal.slides[currentSlide].title}
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {activeTrainingModal.slides[currentSlide].content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentSlide === 0}
                    onClick={() => setCurrentSlide((s) => s - 1)}
                    className="border-slate-700 text-slate-300 text-xs"
                  >
                    Previous Module
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setCurrentSlide((s) => s + 1)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
                  >
                    Next Slide <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Final Quiz & Acknowledgment Step */
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <span className="text-[11px] font-mono text-purple-400 font-bold uppercase">
                    Knowledge Check & Signoff:
                  </span>
                  <p className="font-semibold text-slate-100">{activeTrainingModal.quiz.question}</p>

                  <div className="space-y-2 pt-1">
                    {activeTrainingModal.quiz.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setQuizAnswer(String(idx))}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all ${
                          quizAnswer === String(idx)
                            ? idx === activeTrainingModal.quiz.correct
                              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-medium'
                              : 'bg-rose-950/40 border-rose-500 text-rose-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Digital Signature */}
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signedAcknowledge}
                    onChange={(e) => setSignedAcknowledge(e.target.checked)}
                    className="mt-0.5 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="text-slate-300 text-[11px] leading-relaxed">
                    I acknowledge that I have read, understood, and agreed to adhere to the company's Information Security and Acceptable Use policies.
                  </span>
                </label>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentSlide((s) => s - 1)}
                    className="border-slate-700 text-slate-300 text-xs"
                  >
                    Back to Slides
                  </Button>
                  <Button
                    size="sm"
                    disabled={
                      quizAnswer !== String(activeTrainingModal.quiz.correct) || !signedAcknowledge
                    }
                    onClick={handleCompleteTraining}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Submit & Generate Certificate
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
