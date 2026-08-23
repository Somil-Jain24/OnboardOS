import React, { useState } from 'react';
import { useAIMode } from './AIModeContext';
import { useAuth } from '../../context/AuthContext';
import { AIOrb } from './AIOrb';
import { ROLE_SUGGESTIONS } from './aiRoleKnowledge';
import {
  Plus,
  Sparkles,
  Paperclip,
  Gift,
  Mic,
  Send,
  Cloud,
  Users,
  Activity,
  Code2,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import './ai-workspace.css';

interface AIEmptyStateProps {
  onSendMessage: (text: string) => void;
}

export const AIEmptyState: React.FC<AIEmptyStateProps> = ({ onSendMessage }) => {
  const { currentRole, currentUser } = useAuth();
  const { theme } = useAIMode();
  const isLight = theme === 'light';

  const [inputText, setInputText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const userName =
    currentUser?.name?.split(' ')[0] || (currentRole === 'HR' ? 'Somil' : 'Rahul');

  const suggestions = ROLE_SUGGESTIONS[currentRole] || ROLE_SUGGESTIONS.HR;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'cloud':
        return <Cloud className={cn('w-4 h-4', isLight ? 'text-blue-600' : 'text-cyan-400')} />;
      case 'expert':
        return <Users className={cn('w-4 h-4', isLight ? 'text-indigo-600' : 'text-indigo-400')} />;
      case 'status':
        return <Activity className={cn('w-4 h-4', isLight ? 'text-blue-600' : 'text-emerald-400')} />;
      case 'code':
        return <Code2 className={cn('w-4 h-4', isLight ? 'text-purple-600' : 'text-blue-400')} />;
      case 'help':
        return <HelpCircle className={cn('w-4 h-4', isLight ? 'text-amber-600' : 'text-amber-400')} />;
      case 'shield':
      case 'policy':
      default:
        return <ShieldCheck className={cn('w-4 h-4', isLight ? 'text-indigo-600' : 'text-purple-400')} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12 max-w-4xl mx-auto w-full select-none">
      {/* 1. 3D Glowing Cybernetic Neural Orb */}
      <div className="mb-6 transform hover:scale-105 transition-transform duration-500">
        <AIOrb size="lg" />
      </div>

      {/* 2. Hero Greeting and Subtitle (Matching Light/Dark Mockup) */}
      <div className="text-center space-y-2 mb-8">
        <h1
          className={cn(
            'text-2xl md:text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2',
            isLight
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700'
              : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-white'
          )}
        >
          <span>Hello, {userName}!</span>
          <span className="inline-block animate-bounce">👋</span>
        </h1>
        <p className={cn('text-sm md:text-base font-medium', isLight ? 'text-slate-500' : 'text-slate-400')}>
          How can I help you today?
        </p>
      </div>

      {/* 3. Centered Large Capsule Chat Input with Dynamic Revolving Sidelight */}
      <div className="w-full max-w-2xl mb-8">
        {/* Revolving Sidelight Wrapper */}
        <div
          className={cn(
            'revolving-border-box',
            isLight ? 'shadow-[0_10px_35px_-5px_rgba(59,130,246,0.25)]' : 'shadow-[0_0_35px_rgba(59,130,246,0.25)]'
          )}
        >
          <form
            onSubmit={handleSubmit}
            className={cn(
              'flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full transition-colors',
              isLight
                ? 'revolving-border-inner-light bg-white border border-blue-200/80 shadow-xs'
                : 'revolving-border-inner bg-[#0B1120] border border-blue-500/30'
            )}
          >
            {/* Action Tool Buttons */}
            <div className={cn('flex items-center gap-1', isLight ? 'text-slate-400' : 'text-slate-400')}>
              <button
                type="button"
                className={cn(
                  'p-1.5 rounded-full transition-colors cursor-pointer',
                  isLight ? 'hover:text-slate-700 hover:bg-slate-100' : 'hover:text-white hover:bg-slate-800/80'
                )}
                title="Add attachment"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                className={cn(
                  'p-1.5 rounded-full transition-colors cursor-pointer',
                  isLight ? 'hover:text-blue-600 hover:bg-blue-50' : 'hover:text-cyan-300 hover:bg-slate-800/80'
                )}
                title="Prompts & Reasoning templates"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                type="button"
                className={cn(
                  'p-1.5 rounded-full transition-colors hidden sm:block cursor-pointer',
                  isLight ? 'hover:text-slate-700 hover:bg-slate-100' : 'hover:text-white hover:bg-slate-800/80'
                )}
                title="Attach files"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                className={cn(
                  'p-1.5 rounded-full transition-colors hidden sm:block cursor-pointer',
                  isLight ? 'hover:text-purple-600 hover:bg-purple-50' : 'hover:text-pink-300 hover:bg-slate-800/80'
                )}
                title="Shortcuts"
              >
                <Gift className="w-4 h-4" />
              </button>
            </div>

            {/* Central Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about onboarding..."
              className={cn(
                'flex-1 bg-transparent text-sm focus:outline-hidden px-2',
                isLight ? 'text-slate-900 placeholder-slate-400' : 'text-slate-100 placeholder-slate-500'
              )}
              autoFocus
            />

            {/* Mic & Send Capsule Button */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className={cn(
                  'p-1.5 rounded-full transition-colors cursor-pointer',
                  isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                )}
                title="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={!inputText.trim()}
                className={cn(
                  'p-2 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer',
                  inputText.trim()
                    ? isLight
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/30 scale-105'
                      : 'bg-white text-black hover:bg-neutral-200 shadow-md scale-105'
                    : isLight
                    ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                    : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                )}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 4. Contextual Suggestion Cards in 4-Column Grid */}
      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {suggestions.slice(0, 4).map((card) => (
          <button
            key={card.id}
            onClick={() => onSendMessage(card.query)}
            className={cn(
              'group flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border',
              isLight
                ? 'bg-white border-slate-200/90 hover:border-blue-300 shadow-xs hover:shadow-md'
                : 'ai-glass-card'
            )}
          >
            <div
              className={cn(
                'p-2 rounded-xl transition-colors flex-shrink-0 border',
                isLight
                  ? 'bg-slate-50 border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-200'
                  : 'bg-[#212121] border-neutral-700 group-hover:border-neutral-600 group-hover:bg-[#282828]'
              )}
            >
              {renderIcon(card.iconType)}
            </div>
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  'text-xs font-semibold line-clamp-2 leading-snug transition-colors',
                  isLight ? 'text-slate-800 group-hover:text-blue-600' : 'text-neutral-200 group-hover:text-white'
                )}
              >
                {card.title}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 5. Bottom Subtle Indicator */}
      <div className={cn('flex items-center gap-1.5 text-xs font-medium', isLight ? 'text-slate-400' : 'text-slate-500')}>
        <ChevronDown className={cn('w-3.5 h-3.5 animate-bounce', isLight ? 'text-slate-400' : 'text-slate-500')} />
        <span>Scroll to see your conversations</span>
      </div>
    </div>
  );
};
