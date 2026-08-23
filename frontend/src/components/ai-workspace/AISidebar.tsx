import React, { useState } from 'react';
import { useAIMode } from './AIModeContext';
import { useAuth } from '../../context/AuthContext';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import './ai-workspace.css';

export const AISidebar: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    selectConversation,
    createNewConversation,
    deleteConversation,
    renameConversation,
    searchQuery,
    setSearchQuery,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    sidebarMobileOpen,
    setSidebarMobileOpen,
    filteredConversations,
    theme,
  } = useAIMode();

  const isLight = theme === 'light';
  const { currentUser, currentRole } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);

  // Group conversations into Today, Yesterday, Earlier
  const todayConvs = filteredConversations.filter((c) => c.timeGroup === 'Today');
  const yesterdayConvs = filteredConversations.filter((c) => c.timeGroup === 'Yesterday');
  const earlierConvs = filteredConversations.filter((c) => c.timeGroup === 'Earlier');

  const startEditing = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const saveEditing = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (editTitle.trim()) {
      renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const initials = (currentUser?.name || (currentRole === 'HR' ? 'Somil Jain' : 'Rahul Sharma'))
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarMobileOpen && (
        <div
          onClick={() => setSidebarMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-50 flex flex-col h-full border-r transition-all duration-300 select-none overflow-hidden',
          isLight
            ? 'bg-white border-slate-200/90 text-slate-900'
            : 'bg-[#171717] border-neutral-800 text-neutral-100',
          isSidebarCollapsed ? 'w-16' : 'w-72 sm:w-80',
          sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* 1. Header & Brand */}
        <div
          className={cn(
            'p-4 border-b flex items-center justify-between flex-shrink-0 transition-colors',
            isLight ? 'border-slate-100' : 'border-neutral-800'
          )}
        >
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs flex-shrink-0',
                isLight ? 'bg-gradient-to-tr from-blue-600 to-indigo-600' : 'bg-[#262626] border border-neutral-700'
              )}>
                <Sparkles className={cn('w-4 h-4', isLight ? 'text-cyan-200' : 'text-neutral-200')} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={cn('font-bold text-sm tracking-tight', isLight ? 'text-slate-900' : 'text-white')}>
                    OnboardOS
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border',
                      isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                    )}
                  >
                    AI
                  </span>
                </div>
                <p className={cn('text-[11px] truncate', isLight ? 'text-slate-500' : 'text-neutral-400')}>
                  Intelligent. Automated. Onboarding.
                </p>
              </div>
            </div>
          ) : (
            <div className={cn(
              'w-8 h-8 mx-auto rounded-xl flex items-center justify-center text-white shadow-xs',
              isLight ? 'bg-gradient-to-tr from-blue-600 to-indigo-600' : 'bg-[#262626] border border-neutral-700'
            )}>
              <Sparkles className={cn('w-4 h-4', isLight ? 'text-cyan-200' : 'text-neutral-200')} />
            </div>
          )}

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className={cn(
              'hidden md:flex p-1.5 rounded-lg transition-colors cursor-pointer',
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            )}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* 2. New Chat Action Button */}
        <div className="p-3 flex-shrink-0">
          <button
            onClick={createNewConversation}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-semibold border transition-all cursor-pointer group shadow-xs',
              isLight
                ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-blue-300'
                : 'bg-[#212121] hover:bg-[#2a2a2a] text-neutral-100 border-neutral-700 hover:border-neutral-600',
              isSidebarCollapsed && 'p-2.5 justify-center'
            )}
            title="Start New Conversation"
          >
            <Plus className={cn('w-4 h-4 group-hover:rotate-90 transition-transform duration-200', isLight ? 'text-blue-600' : 'text-white')} />
            {!isSidebarCollapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* 3. Search Filter */}
        {!isSidebarCollapsed && (
          <div className="px-3 pb-2 flex-shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className={cn(
                  'w-full pl-8 pr-3 py-1.5 text-xs rounded-xl focus:outline-hidden transition-colors',
                  isLight
                    ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500'
                    : 'bg-[#212121] border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:border-neutral-600'
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 4. Conversation History Groups */}
        <div className="flex-1 overflow-y-auto ai-scrollbar px-2 space-y-4 py-2">
          {/* Today Group */}
          {todayConvs.length > 0 && (
            <div className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Today
                </div>
              )}
              {todayConvs.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={activeConversationId === conv.id}
                  isCollapsed={isSidebarCollapsed}
                  isEditing={editingId === conv.id}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  isLight={isLight}
                  onSelect={() => selectConversation(conv.id)}
                  onStartEdit={(e) => startEditing(conv.id, conv.title, e)}
                  onSaveEdit={(e) => saveEditing(conv.id, e)}
                  onCancelEdit={cancelEditing}
                  onDelete={(e) => deleteConversation(conv.id, e)}
                />
              ))}
            </div>
          )}

          {/* Yesterday Group */}
          {yesterdayConvs.length > 0 && (
            <div className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Yesterday
                </div>
              )}
              {yesterdayConvs.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={activeConversationId === conv.id}
                  isCollapsed={isSidebarCollapsed}
                  isEditing={editingId === conv.id}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  isLight={isLight}
                  onSelect={() => selectConversation(conv.id)}
                  onStartEdit={(e) => startEditing(conv.id, conv.title, e)}
                  onSaveEdit={(e) => saveEditing(conv.id, e)}
                  onCancelEdit={cancelEditing}
                  onDelete={(e) => deleteConversation(conv.id, e)}
                />
              ))}
            </div>
          )}

          {/* Earlier Group */}
          {earlierConvs.length > 0 && (
            <div className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Earlier
                </div>
              )}
              {earlierConvs.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={activeConversationId === conv.id}
                  isCollapsed={isSidebarCollapsed}
                  isEditing={editingId === conv.id}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  isLight={isLight}
                  onSelect={() => selectConversation(conv.id)}
                  onStartEdit={(e) => startEditing(conv.id, conv.title, e)}
                  onSaveEdit={(e) => saveEditing(conv.id, e)}
                  onCancelEdit={cancelEditing}
                  onDelete={(e) => deleteConversation(conv.id, e)}
                />
              ))}
            </div>
          )}

          {filteredConversations.length === 0 && !isSidebarCollapsed && (
            <div className="text-center py-8 text-xs text-slate-400">
              No conversations found.
            </div>
          )}
        </div>

        {/* 5. Bottom User Profile Card */}
        <div
          className={cn(
            'p-3 border-t flex-shrink-0 transition-colors',
            isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#171717] border-neutral-800'
          )}
        >
          <div
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className={cn(
              'flex items-center gap-3 p-2 rounded-2xl transition-colors cursor-pointer group',
              isLight ? 'hover:bg-slate-200/60' : 'hover:bg-[#212121]',
              isSidebarCollapsed && 'justify-center p-1.5'
            )}
          >
            {/* User Avatar */}
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono shadow-xs flex-shrink-0',
                isLight ? 'bg-blue-600 text-white' : 'bg-[#2f2f2f] border border-neutral-700 text-white'
              )}
            >
              {initials}
            </div>

            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className={cn('text-xs font-bold truncate', isLight ? 'text-slate-900' : 'text-neutral-200')}>
                  {currentUser?.name || (currentRole === 'HR' ? 'Somil Jain' : 'Rahul Sharma')}
                </div>
                <div className={cn('text-[10px] font-medium truncate', isLight ? 'text-slate-500' : 'text-neutral-400 font-mono')}>
                  {currentRole === 'HR' ? 'HR Admin' : currentRole === 'EMPLOYEE' ? 'Backend Developer' : currentRole}
                </div>
              </div>
            )}

            {!isSidebarCollapsed && (
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

interface ConversationItemProps {
  conversation: import('./types').AIConversation;
  isActive: boolean;
  isCollapsed: boolean;
  isEditing: boolean;
  editTitle: string;
  setEditTitle: (t: string) => void;
  isLight?: boolean;
  onSelect: () => void;
  onStartEdit: (e: React.MouseEvent) => void;
  onSaveEdit: (e?: React.MouseEvent) => void;
  onCancelEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  isCollapsed,
  isEditing,
  editTitle,
  setEditTitle,
  isLight = false,
  onSelect,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}) => {
  const timeFormatted = new Date(conversation.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isCollapsed) {
    return (
      <button
        onClick={onSelect}
        className={cn(
          'w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all cursor-pointer',
          isActive
            ? isLight
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-[#212121] text-white border border-neutral-700'
            : isLight
            ? 'text-slate-600 hover:bg-slate-100'
            : 'text-neutral-400 hover:text-white hover:bg-[#212121]'
        )}
        title={conversation.title}
      >
        <MessageSquare className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border',
        isActive
          ? isLight
            ? 'bg-blue-50 text-blue-700 border-blue-200/90 font-semibold shadow-xs'
            : 'bg-[#212121] border-neutral-700 text-white font-medium shadow-xs'
          : isLight
          ? 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          : 'border-transparent text-neutral-300 hover:bg-[#212121] hover:text-white'
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <MessageSquare
          className={cn(
            'w-3.5 h-3.5 flex-shrink-0',
            isActive ? (isLight ? 'text-blue-600' : 'text-neutral-200') : 'text-neutral-500 group-hover:text-neutral-300'
          )}
        />

        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit();
              if (e.key === 'Escape') onCancelEdit(e as any);
            }}
            autoFocus
            className={cn(
              'w-full text-xs px-1.5 py-0.5 rounded border focus:outline-hidden',
              isLight ? 'bg-white text-slate-900 border-blue-400' : 'bg-slate-900 text-white border-blue-500'
            )}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate font-medium">{conversation.title}</span>
        )}
      </div>

      {/* Timestamp & Hover Action Buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <button onClick={onSaveEdit} className="p-1 text-emerald-500 hover:bg-slate-200 rounded" title="Save">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={onCancelEdit} className="p-1 text-slate-400 hover:bg-slate-200 rounded" title="Cancel">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <span
              className={cn(
                'text-[10px] font-mono text-slate-400 group-hover:hidden',
                isActive && (isLight ? 'text-blue-600 font-bold' : 'text-blue-300')
              )}
            >
              {conversation.timeGroup === 'Today' ? timeFormatted : conversation.timeGroup === 'Yesterday' ? timeFormatted : 'Mon'}
            </span>

            <div className="hidden group-hover:flex items-center gap-1">
              <button
                onClick={onStartEdit}
                className={cn('p-1 rounded transition-colors', isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800')}
                title="Rename conversation"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={onDelete}
                className={cn('p-1 rounded transition-colors', isLight ? 'text-slate-400 hover:text-rose-600 hover:bg-slate-200' : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800')}
                title="Delete conversation"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
