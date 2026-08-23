import React, { useState, useRef, useEffect } from 'react';
import { useAIMode } from './AIModeContext';
import { Plus, Sparkles, Paperclip, Gift, Mic, Send } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AIComposerProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const AIComposer: React.FC<AIComposerProps> = ({ onSendMessage, disabled = false }) => {
  const { theme } = useAIMode();
  const isLight = theme === 'light';

  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={cn(
        'sticky bottom-0 z-20 pb-4 pt-2 px-4 w-full transition-colors',
        isLight
          ? 'bg-gradient-to-t from-white via-white/95 to-transparent'
          : 'bg-gradient-to-t from-[#000000] via-[#000000]/95 to-transparent'
      )}
    >
      <div className="max-w-3xl mx-auto">
        <div
          className={cn(
            'flex items-center gap-2 px-3.5 py-2.5 rounded-full transition-all duration-300 shadow-lg border',
            isLight
              ? isFocused
                ? 'bg-white border-blue-500 shadow-[0_10px_35px_-5px_rgba(59,130,246,0.3)]'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-card'
              : isFocused
              ? 'border-neutral-500 shadow-lg bg-[#212121]'
              : 'border-neutral-700 hover:border-neutral-600 bg-[#212121]'
          )}
        >
          {/* Action buttons */}
          <div className="flex items-center gap-1 text-slate-400">
            <button
              type="button"
              className={cn(
                'p-1.5 rounded-full transition-colors cursor-pointer',
                isLight ? 'hover:text-slate-700 hover:bg-slate-100' : 'hover:text-white hover:bg-neutral-800'
              )}
              title="Add attachment"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              className={cn(
                'p-1.5 rounded-full transition-colors cursor-pointer',
                isLight ? 'hover:text-blue-600 hover:bg-blue-50' : 'hover:text-white hover:bg-neutral-800'
              )}
              title="Prompts & Reasoning templates"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              type="button"
              className={cn(
                'p-1.5 rounded-full transition-colors hidden sm:block cursor-pointer',
                isLight ? 'hover:text-slate-700 hover:bg-slate-100' : 'hover:text-white hover:bg-neutral-800'
              )}
              title="Attach files"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="button"
              className={cn(
                'p-1.5 rounded-full transition-colors hidden sm:block cursor-pointer',
                isLight ? 'hover:text-purple-600 hover:bg-purple-50' : 'hover:text-white hover:bg-neutral-800'
              )}
              title="Shortcuts"
            >
              <Gift className="w-4 h-4" />
            </button>
          </div>

          {/* Growing Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about onboarding..."
            className={cn(
              'flex-1 bg-transparent text-sm focus:outline-hidden resize-none max-h-28 py-1 px-2 leading-relaxed',
              isLight ? 'text-slate-900 placeholder-slate-400' : 'text-neutral-100 placeholder-neutral-500'
            )}
          />

          {/* Mic & Send button */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              className={cn(
                'p-1.5 rounded-full transition-colors cursor-pointer',
                isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              )}
              title="Voice input"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!text.trim() || disabled}
              className={cn(
                'p-2 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer',
                text.trim() && !disabled
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
        </div>

        {/* Keyboard shortcut hint */}
        <div className={cn('text-center mt-1.5 text-[10px] font-mono', isLight ? 'text-slate-400' : 'text-neutral-500')}>
          <span>Press Enter to send • Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
};
