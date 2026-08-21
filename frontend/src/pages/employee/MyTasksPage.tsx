import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { useEmployee } from '../../hooks/useOnboardOS';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
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

export function MyTasksPage() {
  const { tasks, employee } = useEmployee('emp-rahul');
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

  // Training Modal State
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
    <div className="space-y-6 text-left">
      <PageHeader
        title="My Onboarding Tasks"
        description="Track and complete your Day-1 setup requirements, hardware receipts, access requests, and compliance trainings."
        badge={
          <Badge variant="default" dot>
            {tasks.filter((t) => t.status === 'COMPLETED').length + completedTrainings.length} Completed
          </Badge>
        }
        actions={
          <Link to="/me/help">
            <Button size="sm" variant="secondary" leftIcon={<HelpCircle className="w-3.5 h-3.5 text-slate-600" />}>
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-xs font-bold'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Interactive Compliance Trainings Section */}
      {(activeCategory === 'ALL' || activeCategory === 'Training') && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pt-1 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Required Compliance & Security Trainings</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainingModules.map((module) => {
              const isCompleted = completedTrainings.includes(module.id);

              return (
                <div
                  key={module.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 bg-white shadow-card ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{module.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{module.description}</p>
                    </div>
                    {isCompleted ? (
                      <StatusBadge status="completed" label="Certified" size="sm" showIcon className="flex-shrink-0" />
                    ) : (
                      <StatusBadge status="warning" label="Required" size="sm" className="flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <span className="text-[11px] text-slate-400 font-mono font-medium">3 Modules • 5 min Quiz</span>
                    <Button
                      size="sm"
                      variant={isCompleted ? 'secondary' : 'primary'}
                      onClick={() => {
                        setActiveTrainingModal(module);
                        setCurrentSlide(0);
                        setQuizAnswer(null);
                        setSignedAcknowledge(false);
                      }}
                      className="text-xs h-8 rounded-xl"
                    >
                      {isCompleted ? 'Review Content' : 'Launch Training Course'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pt-1 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
          <CheckSquare className="w-4 h-4 text-emerald-600" />
          <span>Provisioning & System Setup Checklist</span>
        </div>

        <div className="space-y-2.5">
          {filteredTasks.map((t) => {
            const isDone = t.status === 'COMPLETED';
            const isFailed = t.status === 'FAILED';
            const isBlocked = t.status === 'BLOCKED';
            const isWaiting = t.status === 'WAITING_APPROVAL';

            return (
              <div
                key={t.id}
                className={`p-4 rounded-2xl transition-all border bg-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs md:text-sm ${
                  isDone
                    ? 'border-slate-200/80'
                    : isFailed
                    ? 'border-rose-200 bg-rose-50/20'
                    : isWaiting
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200/90'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isDone ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : isFailed ? (
                    <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : isBlocked ? (
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                  )}

                  <div>
                    <span className={`font-semibold ${isDone ? 'line-through text-slate-500' : 'text-slate-900 font-bold'}`}>
                      {t.name}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>Category: <strong className="text-slate-600">{t.category}</strong></span>
                      <span>•</span>
                      <span>Adapter: <code className="text-slate-700 font-mono bg-slate-100 px-1 py-0.2 rounded">{t.adapterType}</code></span>
                    </div>
                  </div>
                </div>

                <StatusBadge
                  status={
                    isDone
                      ? 'completed'
                      : isFailed
                      ? 'failed'
                      : isBlocked
                      ? 'blocked'
                      : 'pending'
                  }
                  label={
                    isDone
                      ? 'Granted'
                      : isFailed
                      ? 'IT Provisioning Error'
                      : isBlocked
                      ? 'Blocked on Upstream'
                      : 'Pending Setup'
                  }
                  size="sm"
                  className="flex-shrink-0"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Training Course Modal */}
      {activeTrainingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-xl w-full p-6 bg-white border border-slate-200 rounded-3xl shadow-2xl space-y-5 text-left animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{activeTrainingModal.title}</h3>
                  <span className="text-[11px] text-slate-500 font-mono font-medium">
                    Step {currentSlide + 1} of {activeTrainingModal.slides.length + 1}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveTrainingModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slide Content View */}
            {currentSlide < activeTrainingModal.slides.length ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                  <h4 className="font-bold text-blue-700 text-sm">
                    {activeTrainingModal.slides[currentSlide].title}
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    {activeTrainingModal.slides[currentSlide].content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={currentSlide === 0}
                    onClick={() => setCurrentSlide((s) => s - 1)}
                    className="text-xs"
                  >
                    Previous Module
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setCurrentSlide((s) => s + 1)}
                    className="text-xs"
                  >
                    Next Slide <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Final Quiz & Acknowledgment Step */
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                  <span className="text-[11px] font-mono text-purple-700 font-bold uppercase">
                    Knowledge Check & Signoff:
                  </span>
                  <p className="font-bold text-slate-900">{activeTrainingModal.quiz.question}</p>

                  <div className="space-y-2 pt-1">
                    {activeTrainingModal.quiz.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setQuizAnswer(String(idx))}
                        className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          quizAnswer === String(idx)
                            ? idx === activeTrainingModal.quiz.correct
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold shadow-xs'
                              : 'bg-rose-50 border-rose-300 text-rose-900 font-semibold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Digital Signature */}
                <label className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signedAcknowledge}
                    onChange={(e) => setSignedAcknowledge(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-600 text-[11px] leading-relaxed">
                    I acknowledge that I have read, understood, and agreed to adhere to the company's Information Security and Acceptable Use policies.
                  </span>
                </label>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setCurrentSlide((s) => s - 1)}
                    className="text-xs"
                  >
                    Back to Slides
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    disabled={
                      quizAnswer !== String(activeTrainingModal.quiz.correct) || !signedAcknowledge
                    }
                    onClick={handleCompleteTraining}
                    className="text-xs"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Submit & Generate Certificate
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

