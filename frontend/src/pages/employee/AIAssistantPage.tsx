import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { useEmployee } from '../../hooks/useOnboardOS';
import { client } from '../../services';
import {
  Sparkles,
  Send,
  HelpCircle,
  BookOpen,
  User,
  Shield,
  Clock,
  ArrowRight,
  Loader2,
  FileText,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: { docId: string; docTitle: string; snippet: string }[];
}

export function AIAssistantPage() {
  const { employee } = useEmployee('emp-rahul');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Hello Rahul! 👋 I'm your OnboardOS AI Assistant. I have full context on your role as Junior Backend Developer on the Payments Core team. How can I help you today?`,
      timestamp: '09:00 AM',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    'Why is my Jira access not ready?',
    'How do I get AWS cloud production access?',
    'Who is my technical mentor?',
    'What should I prepare for Day 1?',
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
      let replyText = '';
      let citations: any[] = [];

      if (textToSend.toLowerCase().includes('jira')) {
        replyText = `Your Jira Software account creation is currently encountering an automated rate limit error (HTTP 503) on the external API. IT Operations is actively retrying this task, and our orchestrator will automatically unblock your Payments sprint backlog assignment as soon as it succeeds.`;
      } else if (textToSend.toLowerCase().includes('aws')) {
        replyText = `Under corporate policy v1.0.0, AWS production access for Junior Engineers requires explicit signoff from your manager (Marcus Vance). A high-priority approval ticket has already been routed to Marcus with an SLA target of 4 hours.`;
        citations = [
          {
            docId: 'doc-1',
            docTitle: 'Engineering Security & Cloud Deployment Policy',
            snippet: 'Junior engineers require Engineering Manager authorization before cloud IAM grants are activated.',
          },
        ];
      } else if (textToSend.toLowerCase().includes('mentor')) {
        replyText = `Your assigned technical mentor is Kavita Rao (Staff Backend Engineer, @kavita.rao on Slack), and your culture buddy is Alex Rivera (Product Designer, @alex.rivera). Kavita has scheduled your first 1:1 welcome tour on September 1st at 11:00 AM.`;
      } else {
        const rag = await client.searchKnowledge(textToSend);
        replyText = rag.answer;
        citations = rag.citations;
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations,
      };

      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="AI Onboarding Concierge (FR-AI-01)"
        description="Context-aware conversational assistant grounded in company policy, your team assignments, and live provisioning status."
        badge={<Badge variant="purple" dot>Context: Rahul Sharma (Engineering / Payments)</Badge>}
      />

      {/* Quick Prompts Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-400 font-mono flex items-center gap-1 flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Suggested:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-slate-100 transition-colors whitespace-nowrap cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <Card className="h-[520px] flex flex-col bg-slate-900/90 border-slate-800 p-0 overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'assistant' && (
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 h-8 w-8 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-2xl space-y-2 ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <p>{m.text}</p>

                {/* Citations Chip Box */}
                {m.citations && m.citations.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono block">Policy Citations:</span>
                    {m.citations.map((c, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-purple-300 flex items-start gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>{c.docTitle}:</strong> <em>"{c.snippet}"</em>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-slate-400 block text-right font-mono">
                  {m.timestamp}
                </span>
              </div>

              {m.sender === 'user' && (
                <Avatar name="Rahul Sharma" size="sm" status="online" />
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-purple-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing context snapshot & policy knowledgebase...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about your access, team setup, policies, or start date..."
            className="flex-1 h-10 px-3.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <Button
            size="md"
            variant="primary"
            disabled={!inputQuery.trim() || isTyping}
            onClick={() => handleSend()}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
}
