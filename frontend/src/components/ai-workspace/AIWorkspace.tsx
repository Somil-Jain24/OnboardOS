import React, { useRef, useEffect } from 'react';
import { useAIMode } from './AIModeContext';
import { AISidebar } from './AISidebar';
import { AIHeader } from './AIHeader';
import { AIEmptyState } from './AIEmptyState';
import { AIChatMessages } from './AIChatMessages';
import { AIComposer } from './AIComposer';
import { cn } from '../../utils/cn';
import './ai-workspace.css';

export const AIWorkspace: React.FC = () => {
  const { currentConversation, sendMessage, isThinking, theme } = useAIMode();
  const isLight = theme === 'light';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasMessages = Boolean(currentConversation && currentConversation.messages.length > 0);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (hasMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentConversation?.messages, hasMessages]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9990] flex font-sans overflow-hidden animate-in fade-in duration-300 transition-colors duration-300',
        isLight ? 'bg-white text-slate-900' : 'bg-[#000000] text-neutral-100'
      )}
    >
      {/* 1. Left Conversation Sidebar */}
      <AISidebar />

      {/* 2. Main AI Canvas & Chat Experience */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 h-full relative overflow-hidden transition-colors duration-300',
          isLight
            ? 'bg-radial from-blue-50/60 via-white to-slate-50'
            : 'bg-[#000000]'
        )}
      >
        {/* Ambient Top Glow Effect */}
        {isLight && (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full blur-3xl pointer-events-none bg-gradient-to-b from-blue-400/15 via-indigo-400/5 to-transparent"
          />
        )}

        {/* AI Top Header */}
        <AIHeader />

        {/* Scrollable Center Content */}
        <main className="flex-1 overflow-y-auto ai-scrollbar flex flex-col justify-between relative z-10 pt-4">
          {!hasMessages ? (
            <AIEmptyState onSendMessage={sendMessage} />
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex-1 pt-4">
                <AIChatMessages
                  messages={currentConversation?.messages || []}
                  onRetry={() => {
                    const lastMsg = currentConversation?.messages.find((m) => m.sender === 'user');
                    if (lastMsg) sendMessage(lastMsg.content);
                  }}
                  onSendMessage={sendMessage}
                />
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Sticky Composer */}
              <AIComposer onSendMessage={sendMessage} disabled={isThinking} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
