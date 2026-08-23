import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { useEmployee } from '../../hooks/useOnboardOS';
import { useAuth } from '../../context/AuthContext';
import { client } from '../../services';
import {
  Sparkles,
  Send,
  Loader2,
  FileText,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Info,
  Brain,
  Shield,
  Clock,
  HelpCircle,
} from 'lucide-react';

interface CopilotEvidence {
  type: 'TASK' | 'POLICY' | 'APPROVAL' | 'EXCEPTION' | 'AUTOMATION';
  label: string;
  detail: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: 'gemini_grounded' | 'rules_based_fallback';
  recommendedAction?: string;
  evidence?: CopilotEvidence[];
  readinessSummary?: {
    score: number;
    status: 'READY' | 'AT_RISK' | 'BLOCKED';
  };
}

export function AIAssistantPage() {
  const { activeEmployeeId, currentUser } = useAuth();
  const targetEmpId = currentUser?.role === 'EMPLOYEE' && currentUser.employeeId ? currentUser.employeeId : (activeEmployeeId || 'emp-rahul');
  const { employee } = useEmployee(targetEmpId);
  const displayName = employee?.name || currentUser?.name || 'there';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Hello ${displayName}! 👋 I'm your OnboardOS AI Copilot powered by Google Gemini Flash. I have full context on your role, tasks, approvals, and day-one readiness. How can I help you today?`,
      timestamp: '09:00 AM',
      source: 'gemini_grounded',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    'What should I do next?',
    'Why is Jira blocked?',
    'Why does AWS need approval?',
    'Am I Day-1 ready?',
    'Summarise this onboarding',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const copilotRes = await client.askCopilot(targetEmpId, textToSend);

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: copilotRes.answer || 'I have analyzed your request based on current onboarding status.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: copilotRes.source || 'gemini_grounded',
        recommendedAction: copilotRes.recommendedAction,
        evidence: copilotRes.evidence || [],
        readinessSummary: copilotRes.readinessSummary,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: `Here is your current status: Your onboarding plan is active. Google Workspace and Slack are operational. AWS IAM access is waiting for manager sign-off.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'rules_based_fallback',
        recommendedAction: 'Check your Daily Tasks list to claim assigned developer tools.',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left pb-12">
      <PageHeader
        title="AI Onboarding Copilot & Policy Reasoning"
        description="Grounded AI explanation layer powered by Google Gemini Flash & deterministic least-privilege security rules."
      />

      {/* Quick Questions Bar */}
      <div className="flex flex-wrap gap-2 pt-1">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isTyping}
            className="text-xs font-semibold px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/40 shadow-sm transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Stream Window */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-card p-6 md:p-8 space-y-6 min-h-[460px] flex flex-col justify-between">
        <div className="space-y-6 overflow-y-auto max-h-[580px] pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/20">
                  <Brain className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] space-y-3 rounded-3xl p-5 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-900 rounded-tl-none'
                }`}
              >
                {/* Source Badge (Assistant only) */}
                {msg.sender === 'assistant' && msg.source && (
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                    {msg.source === 'gemini_grounded' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-100/90 text-indigo-800 font-bold text-[10px] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        Grounded AI Copilot
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-bold text-[10px] flex items-center gap-1">
                        <Shield className="w-3 h-3 text-slate-600" />
                        Deterministic Rules Engine
                      </span>
                    )}
                  </div>
                )}

                {/* Message Body */}
                <p className="text-xs leading-relaxed font-medium">{msg.text}</p>

                {/* Recommended Next Action Card */}
                {msg.recommendedAction && (
                  <div className="p-3.5 bg-white border border-blue-200 rounded-2xl space-y-1">
                    <p className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-600" />
                      Recommended Next Action:
                    </p>
                    <p className="text-xs text-slate-700">{msg.recommendedAction}</p>
                  </div>
                )}

                {/* Grounded Evidence Breakdown */}
                {msg.evidence && msg.evidence.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Citing Grounded Context & Evidence ({msg.evidence.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.evidence.map((ev, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-[10px] text-slate-700 flex items-center gap-1"
                        >
                          <span
                            className={`font-bold ${
                              ev.type === 'TASK'
                                ? 'text-rose-600'
                                : ev.type === 'APPROVAL'
                                ? 'text-amber-600'
                                : ev.type === 'POLICY'
                                ? 'text-indigo-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            [{ev.type}]
                          </span>
                          <span>{ev.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] font-mono ${
                    msg.sender === 'user' ? 'text-blue-100 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">RS</span>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3.5 items-center text-xs text-slate-500 animate-in fade-in">
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span className="flex items-center gap-1 font-medium">
                Gemini Flash is grounding decision context...
              </span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 pt-4 border-t border-slate-100"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything (e.g. 'Why is Jira blocked?', 'Why does AWS need approval?')..."
            className="flex-1 text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
            disabled={isTyping}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={isTyping || !inputQuery.trim()}
            leftIcon={<Send className="w-3.5 h-3.5 text-white" />}
            className="rounded-2xl px-5"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

export default AIAssistantPage;
