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
  Database,
  Search,
  Activity,
  Layers,
  Cpu,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import './ai-workspace.css';

interface AIChatMessagesProps {
  messages: AIMessage[];
  onRetry?: () => void;
  onSendMessage?: (text: string) => void;
}

export const AIChatMessages: React.FC<AIChatMessagesProps> = ({ messages, onRetry, onSendMessage }) => {
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
                  'max-w-xl md:max-w-2xl rounded-3xl rounded-tr-xs px-5 py-3.5 shadow-sm',
                  isLight
                    ? 'bg-blue-600 text-white shadow-blue-500/20'
                    : 'bg-[#212121] border border-neutral-800 text-neutral-100'
                )}
              >
                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <div
                  className={cn(
                    'mt-1.5 text-right text-[10px] font-mono',
                    isLight ? 'text-blue-100' : 'text-neutral-400'
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
                    : 'bg-[#2f2f2f] border border-neutral-700 text-white'
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
            onSendMessage={onSendMessage}
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
  onSendMessage?: (text: string) => void;
  isLight?: boolean;
}

const AssistantMessageItem: React.FC<AssistantMessageItemProps> = ({ message, onRetry, onSendMessage, isLight = false }) => {
  const navigate = useNavigate();
  const [evidenceOpen, setEvidenceOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActionClick = (action: { deepLink?: string; actionKey?: string; label?: string }) => {
    if (action.actionKey === 'CONFIRM_CREATE_EMP') {
      onSendMessage?.('Confirm');
      return;
    }
    if (action.actionKey === 'CONFIRM_OFFBOARD') {
      onSendMessage?.('Confirm Offboarding');
      return;
    }
    if (action.actionKey === 'CONFIRM_BULK_CREATE') {
      onSendMessage?.('Confirm');
      return;
    }
    if (action.actionKey === 'CANCEL_ACTION') {
      onSendMessage?.('Cancel');
      return;
    }
    if (action.deepLink) {
      navigate(action.deepLink);
    }
  };

  // 1. Sleek Modern Three Bouncing Dots & Thinking Indicator
  if (message.status === 'thinking') {
    return (
      <div className="flex gap-3 items-start animate-in fade-in duration-200">
        {/* AI Avatar */}
        <div className={cn(
          'w-8 h-8 rounded-full p-0.5 flex-shrink-0 flex items-center justify-center',
          isLight
            ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-md shadow-blue-500/20'
            : 'bg-[#262626] border border-neutral-700'
        )}>
          <div className={cn('w-full h-full rounded-full flex items-center justify-center', isLight ? 'bg-[#070D1D]' : 'bg-[#171717]')}>
            <Sparkles className={cn('w-4 h-4 animate-pulse', isLight ? 'text-cyan-300' : 'text-neutral-200')} />
          </div>
        </div>

        {/* Bouncing Three Dots with Thinking text */}
        <div
          className={cn(
            'rounded-3xl rounded-tl-xs px-5 py-3.5 flex items-center gap-3 border shadow-xs transition-all',
            isLight
              ? 'bg-white border-slate-200/90 text-slate-700 shadow-slate-100'
              : 'bg-[#212121] border-neutral-800 text-neutral-200'
          )}
        >
          <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Thinking</span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className={cn('w-2 h-2 rounded-full animate-bounce', isLight ? 'bg-blue-500' : 'bg-neutral-400')} style={{ animationDelay: '0ms' }} />
            <span className={cn('w-2 h-2 rounded-full animate-bounce', isLight ? 'bg-indigo-500' : 'bg-neutral-300')} style={{ animationDelay: '150ms' }} />
            <span className={cn('w-2 h-2 rounded-full animate-bounce', isLight ? 'bg-cyan-400' : 'bg-neutral-200')} style={{ animationDelay: '300ms' }} />
          </div>
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
      <div className={cn(
        'w-8 h-8 rounded-full p-0.5 flex-shrink-0 flex items-center justify-center',
        isLight
          ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-md shadow-blue-500/30'
          : 'bg-[#262626] border border-neutral-700'
      )}>
        <div className={cn('w-full h-full rounded-full flex items-center justify-center', isLight ? 'bg-[#070D1D]' : 'bg-[#171717]')}>
          <Sparkles className={cn('w-4 h-4', isLight ? 'text-cyan-300' : 'text-neutral-200')} />
        </div>
      </div>

      <div className="flex-1 space-y-3 min-w-0">
        {/* Main Content Box */}
        <div
          className={cn(
            'rounded-3xl rounded-tl-xs px-5 py-4 shadow-sm border space-y-3.5',
            isLight
              ? 'bg-white border-slate-200/90 text-slate-800 shadow-card'
              : 'bg-[#171717] border-neutral-800 text-neutral-200'
          )}
        >
          {/* Rich Formatted Markdown Content */}
          <div className="text-sm leading-relaxed space-y-2.5 max-w-none">
            <MarkdownRenderer content={message.content} isLight={isLight} />
          </div>

          {/* Streaming Cursor */}
          {message.status === 'streaming' && (
            <span className={cn('inline-block w-2 h-4 ml-1 animate-pulse', isLight ? 'bg-blue-600' : 'bg-neutral-300')} />
          )}

        </div>

        {/* Footer Meta & Copy */}
        <div className="flex items-center justify-between px-2 text-[11px]">
          <div className={cn('flex items-center gap-2 font-mono', isLight ? 'text-slate-400' : 'text-slate-400')}>
            <span>{message.timestamp}</span>
            <span>•</span>
            <span
              className={cn(
                'font-semibold flex items-center gap-1',
                message.evidence?.sourceType === 'SECURITY_GUARD'
                  ? 'text-amber-600 dark:text-amber-400'
                  : message.evidence?.isDeterministic === false || message.evidence?.sourceType === 'GEMINI_FALLBACK'
                  ? 'text-purple-600 dark:text-purple-400'
                  : isLight
                  ? 'text-blue-600'
                  : 'text-cyan-400'
              )}
            >
              {message.evidence?.sourceType === 'SECURITY_GUARD'
                ? '🛡️ Security Policy'
                : message.evidence?.isDeterministic === false || message.evidence?.sourceType === 'GEMINI_FALLBACK'
                ? '✨ AI Assistant'
                : '✓ OnboardOS Intelligence'}
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

// --- Custom Markdown & Table Component ---
function MarkdownRenderer({ content, isLight }: { content: string; isLight: boolean }) {
  // 1. Clean and normalize content (strip leading > from all lines, remove trailing fake button code)
  const normalized = content
    .split('\n')
    .map((line) => line.replace(/^>\s?/, ''))
    .join('\n')
    .replace(/`[^`]+→`(\s*\|\s*`[^`]+→`)*/g, '')
    .trim();

  const blocks = normalized.split(/\n\s*\n/);

  return (
    <div className="space-y-3.5 text-xs md:text-sm leading-relaxed">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // 1. Table formatting
        if (trimmed.includes('|') && trimmed.includes('\n|')) {
          const lines = trimmed.split('\n').filter((l) => l.trim().startsWith('|'));
          if (lines.length >= 2) {
            const headerLine = lines[0];
            const headers = headerLine
              .split('|')
              .filter((c) => c.trim() !== '')
              .map((c) => c.trim());

            const dataRows = lines.slice(2).map((row) =>
              row
                .split('|')
                .filter((c) => c.trim() !== '')
                .map((c) => c.trim())
            );

            return (
              <div
                key={idx}
                className={cn(
                  'overflow-x-auto rounded-2xl border my-3 shadow-xs',
                  isLight ? 'border-slate-200 bg-white' : 'border-neutral-800 bg-[#212121]'
                )}
              >
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr
                      className={cn(
                        'border-b font-mono font-bold uppercase tracking-wider',
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                      )}
                    >
                      {headers.map((h, i) => (
                        <th key={i} className="px-4 py-2.5">
                          {renderInline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataRows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={cn(
                          'border-b transition-colors last:border-0',
                          isLight ? 'border-slate-100 hover:bg-slate-50/80' : 'border-neutral-800 hover:bg-neutral-800/40'
                        )}
                      >
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-2.5 font-medium">
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // 2. Headings
        if (trimmed.startsWith('## ')) {
          return (
            <h2
              key={idx}
              className={cn(
                'text-base font-bold tracking-tight pt-2 pb-1 border-b',
                isLight ? 'text-slate-900 border-slate-100' : 'text-white border-neutral-800'
              )}
            >
              {renderInline(trimmed.replace(/^##\s+/, ''))}
            </h2>
          );
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={idx}
              className={cn(
                'text-sm font-bold tracking-tight pt-1.5',
                isLight ? 'text-slate-900' : 'text-neutral-100'
              )}
            >
              {renderInline(trimmed.replace(/^###\s+/, ''))}
            </h3>
          );
        }

        // 3. Lists
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ') || /^\d+\.\s/.test(trimmed)) {
          const listLines = trimmed.split('\n');
          return (
            <ul key={idx} className="space-y-1.5 pl-1 my-2">
              {listLines.map((line, lIdx) => {
                const lineTrimmed = line.trim();
                if (!lineTrimmed) return null;
                const isNumbered = /^\d+\.\s/.test(lineTrimmed);
                const numberMatch = lineTrimmed.match(/^(\d+)\.\s/);
                const cleanLine = lineTrimmed.replace(/^(\*|-|•|\d+\.)\s+/, '');

                return (
                  <li key={lIdx} className="flex items-start gap-2 text-xs leading-relaxed">
                    {isNumbered ? (
                      <span className={cn('font-mono font-semibold min-w-4 text-right select-none', isLight ? 'text-blue-600' : 'text-neutral-400')}>
                        {numberMatch ? `${numberMatch[1]}.` : '•'}
                      </span>
                    ) : (
                      <span className={cn('font-bold select-none', isLight ? 'text-blue-500' : 'text-neutral-400')}>
                        •
                      </span>
                    )}
                    <span className="flex-1">
                      {renderInline(cleanLine)}
                    </span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // 4. Standard paragraph
        return (
          <p key={idx} className="leading-relaxed whitespace-pre-wrap">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Utility to render inline bold, code, badges
function renderInline(text: string) {
  // Regex to split by bold **text** and `code`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-inherit">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-neutral-800/60 text-neutral-200 font-mono text-[11px] border border-neutral-700/50">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
