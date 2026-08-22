import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAIMode } from './AIModeContext';
import type { AIMessage } from './types';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RotateCcw,
  Shield,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import './ai-workspace.css';

interface AIChatMessagesProps {
  messages: AIMessage[];
  onRetry?: () => void;
}

export const AIChatMessages: React.FC<AIChatMessagesProps> = ({ messages, onRetry }) => {
  const { currentUser, currentRole } = useAuth();
  const { theme } = useAIMode();
  const isLight = theme === 'light';

  const userInitials = (currentUser?.name || (currentRole === 'HR' ? 'Somil Jain' : 'Rahul Sharma'))
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 pb-6 max-w-4xl mx-auto w-full px-4">
      {messages.map((message) => {
        if (message.sender === 'user') {
          return (
            <div key={message.id} className="flex justify-end gap-3 items-start select-text">
              <div
                className={cn(
                  'max-w-xl md:max-w-2xl rounded-3xl rounded-tr-xs px-5 py-3.5 backdrop-blur-md shadow-md',
                  isLight
                    ? 'bg-blue-600 text-white shadow-blue-500/20'
                    : 'bg-gradient-to-r from-blue-600/30 to-indigo-600/20 border border-blue-500/30 text-slate-100 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                )}
              >
                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <div
                  className={cn(
                    'mt-1.5 text-right text-[10px] font-mono',
                    isLight ? 'text-blue-100' : 'text-blue-300/70'
                  )}
                >
                  {message.timestamp}
                </div>
              </div>
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono shadow-xs flex-shrink-0',
                  isLight
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-800 border border-slate-700 text-white'
                )}
              >
                {userInitials}
              </div>
            </div>
          );
        }

        // Assistant Message
        return (
          <AssistantMessageItem
            key={message.id}
            message={message}
            onRetry={onRetry}
            isLight={isLight}
          />
        );
      })}
    </div>
  );
};

interface AssistantMessageItemProps {
  message: AIMessage;
  onRetry?: () => void;
  isLight?: boolean;
}

const AssistantMessageItem: React.FC<AssistantMessageItemProps> = ({ message, onRetry, isLight = false }) => {
  const navigate = useNavigate();
  const [evidenceOpen, setEvidenceOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActionClick = (action: { deepLink?: string; actionKey?: string }) => {
    if (action.deepLink) {
      navigate(action.deepLink);
    }
  };

  if (message.status === 'thinking') {
    return (
      <div className="flex gap-3.5 items-start">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/30 flex-shrink-0 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-[#070D1D] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
          </div>
        </div>
        <div
          className={cn(
            'rounded-3xl rounded-tl-xs px-5 py-3.5 flex items-center gap-3 shadow-sm border',
            isLight
              ? 'bg-white border-slate-200 text-slate-800'
              : 'ai-glass-panel text-slate-200 border-slate-800'
          )}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
          </div>
          <span className="text-xs font-medium">
            OnboardOS is reasoning over policy DAG & graph context...
          </span>
        </div>
      </div>
    );
  }

  if (message.status === 'error') {
    return (
      <div className="flex gap-3.5 items-start">
        <div className="w-8 h-8 rounded-full bg-rose-950/80 border border-rose-500/50 p-1 flex-shrink-0 flex items-center justify-center">
          <AlertCircle className="w-4 h-4 text-rose-400" />
        </div>
        <div className="rounded-3xl rounded-tl-xs px-5 py-4 border border-rose-200 bg-rose-50 text-rose-800 space-y-3">
          <p className="text-xs">{message.content}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Query</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3.5 items-start select-text group">
      {/* OnboardOS AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/30 flex-shrink-0 flex items-center justify-center">
        <div className="w-full h-full rounded-full bg-[#070D1D] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-cyan-300" />
        </div>
      </div>

      <div className="flex-1 space-y-3 min-w-0">
        {/* Main Content Box */}
        <div
          className={cn(
            'rounded-3xl rounded-tl-xs px-5 py-4 shadow-sm border space-y-3.5',
            isLight
              ? 'bg-white border-slate-200/90 text-slate-800 shadow-card'
              : 'ai-glass-panel border-slate-800/80 text-slate-200'
          )}
        >
          {/* Formatted Text Content */}
          <div className="text-sm leading-relaxed space-y-2 max-w-none">
            {message.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Streaming Cursor */}
          {message.status === 'streaming' && (
            <span className={cn('inline-block w-2 h-4 ml-1 animate-pulse', isLight ? 'bg-blue-600' : 'bg-cyan-400')} />
          )}

          {/* Expandable Decision Reasoning / Evidence Card */}
          {message.evidence?.whyThisDecision && (
            <div
              className={cn(
                'rounded-2xl border overflow-hidden mt-3',
                isLight
                  ? 'border-blue-200/90 bg-blue-50/40 shadow-xs'
                  : 'border-blue-500/30 bg-[#070E20]/90 shadow-inner'
              )}
            >
              <button
                onClick={() => setEvidenceOpen((prev) => !prev)}
                className={cn(
                  'w-full px-4 py-2.5 flex items-center justify-between border-b text-xs font-bold cursor-pointer transition-colors',
                  isLight
                    ? 'bg-blue-100/50 hover:bg-blue-100/80 border-blue-200/80 text-blue-900'
                    : 'bg-blue-950/30 hover:bg-blue-950/50 border-blue-500/20 text-cyan-300'
                )}
              >
                <div className="flex items-center gap-2">
                  <Shield className={cn('w-3.5 h-3.5', isLight ? 'text-blue-600' : 'text-blue-400')} />
                  <span>Why this decision? (RBAC & Policy Evidence)</span>
                </div>
                {evidenceOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {evidenceOpen && (
                <div className="p-4 space-y-3 text-xs">
                  {/* Checks List */}
                  <div className="space-y-2">
                    {message.evidence.whyThisDecision.checks?.map((check, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2
                          className={cn(
                            'w-4 h-4 flex-shrink-0 mt-0.5',
                            check.passed ? (isLight ? 'text-emerald-600' : 'text-emerald-400') : 'text-amber-500'
                          )}
                        />
                        <div>
                          <span className={cn('font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>
                            {check.label}
                          </span>
                          {check.detail && (
                            <span className={cn('text-[11px] block', isLight ? 'text-slate-500' : 'text-slate-400')}>
                              {check.detail}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Stats Badges */}
                  {message.evidence.stats && (
                    <div
                      className={cn(
                        'pt-2 border-t flex flex-wrap items-center gap-2 text-[11px] font-mono',
                        isLight ? 'border-slate-200' : 'border-slate-800'
                      )}
                    >
                      {message.evidence.stats.readinessScore !== undefined && (
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-md border',
                            isLight
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                          )}
                        >
                          Readiness: {message.evidence.stats.readinessScore}%
                        </span>
                      )}
                      {message.evidence.stats.riskScore !== undefined && (
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-md border',
                            isLight
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                          )}
                        >
                          Risk Index: {message.evidence.stats.riskScore}
                        </span>
                      )}
                      {message.evidence.stats.completedTasks !== undefined && (
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-md border',
                            isLight
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                          )}
                        >
                          Tasks: {message.evidence.stats.completedTasks}/{message.evidence.stats.totalTasks || 6}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Deep Link to Entity */}
                  {message.evidence.deepLink && (
                    <div className="pt-1">
                      <button
                        onClick={() => navigate(message.evidence?.deepLink || '/')}
                        className={cn(
                          'inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer group/link',
                          isLight ? 'text-blue-600 hover:text-blue-700' : 'text-cyan-400 hover:text-cyan-300'
                        )}
                      >
                        <span>{message.evidence.deepLinkLabel || 'Inspect Evidence in Command Center'}</span>
                        <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {message.actions && message.actions.length > 0 && (
            <div
              className={cn(
                'flex flex-wrap items-center gap-2 pt-2 border-t',
                isLight ? 'border-slate-100' : 'border-slate-800/60'
              )}
            >
              {message.actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleActionClick(action)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                    action.primary
                      ? isLight
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/30'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  )}
                >
                  <span>{action.label}</span>
                  {action.deepLink && <ExternalLink className="w-3 h-3 opacity-70" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Meta & Copy */}
        <div className="flex items-center justify-between px-2 text-[11px]">
          <div className={cn('flex items-center gap-2 font-mono', isLight ? 'text-slate-400' : 'text-slate-400')}>
            <span>{message.timestamp}</span>
            <span>•</span>
            <span className={isLight ? 'text-blue-600 font-semibold' : 'text-cyan-400/80'}>
              OnboardOS Intelligence
            </span>
          </div>

          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1 transition-colors p-1 rounded cursor-pointer',
              isLight ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            )}
            title="Copy response"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
