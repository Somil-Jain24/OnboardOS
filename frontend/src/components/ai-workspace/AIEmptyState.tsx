import React, { useState, useRef, useEffect } from 'react';
import { useAIMode } from './AIModeContext';
import { useAuth } from '../../context/AuthContext';
import { AIOrb } from './AIOrb';
import { ROLE_SUGGESTIONS } from './aiRoleKnowledge';
import {
  Plus,
  Sparkles,
  Paperclip,
  Mic,
  Send,
  Cloud,
  Users,
  Activity,
  Code2,
  HelpCircle,
  ShieldCheck,
  Image as ImageIcon,
  FileSpreadsheet,
  FileText,
  File,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import './ai-workspace.css';

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  textContent?: string;
}

interface AIEmptyStateProps {
  onSendMessage: (text: string) => void;
}

export const AIEmptyState: React.FC<AIEmptyStateProps> = ({ onSendMessage }) => {
  const { currentRole, currentUser } = useAuth();
  const { theme } = useAIMode();
  const isLight = theme === 'light';

  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const userName =
    currentUser?.name?.split(' ')[0] || (currentRole === 'HR' ? 'Somil' : 'Rahul');

  const suggestions = ROLE_SUGGESTIONS[currentRole] || ROLE_SUGGESTIONS.HR;

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleProcessFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const newFile: AttachedFile = {
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        size: file.size,
        type: file.type,
      };

      if (
        file.type.startsWith('text/') ||
        file.name.endsWith('.csv') ||
        file.name.endsWith('.json') ||
        file.name.endsWith('.md') ||
        file.name.endsWith('.txt')
      ) {
        const reader = new FileReader();
        reader.onload = (event) => {
          newFile.textContent = event.target?.result as string;
          setAttachedFiles((prev) => [...prev, newFile]);
        };
        reader.readAsText(file);
      } else {
        setAttachedFiles((prev) => [...prev, newFile]);
      }
    });

    setIsMenuOpen(false);
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-3.5 h-3.5 text-purple-500" />;
    if (fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls'))
      return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />;
    if (fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx') || fileName.endsWith('.txt'))
      return <FileText className="w-3.5 h-3.5 text-blue-500" />;
    return <File className="w-3.5 h-3.5 text-slate-500" />;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && attachedFiles.length === 0) return;

    let finalMessage = inputText.trim();
    if (attachedFiles.length > 0) {
      const fileHeaders = attachedFiles
        .map((f) => `📎 **[Attached File: ${f.name} (${formatFileSize(f.size)})]**`)
        .join('\n');

      const fileContext = attachedFiles
        .filter((f) => f.textContent)
        .map((f) => `\n\`\`\`\n// Content of ${f.name}:\n${f.textContent?.slice(0, 800)}\n\`\`\``)
        .join('\n');

      if (finalMessage) {
        finalMessage = `${fileHeaders}${fileContext}\n\n${finalMessage}`;
      } else {
        finalMessage = `${fileHeaders}${fileContext}\n\nPlease analyze the attached file(s) and proceed with onboarding processing.`;
      }
    }

    onSendMessage(finalMessage);
    setInputText('');
    setAttachedFiles([]);
    setIsMenuOpen(false);
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
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => handleProcessFiles(e.target.files)}
        className="hidden"
        accept="*/*"
      />
      <input
        ref={photoInputRef}
        type="file"
        multiple
        onChange={(e) => handleProcessFiles(e.target.files)}
        className="hidden"
        accept="image/*"
      />
      <input
        ref={csvInputRef}
        type="file"
        onChange={(e) => handleProcessFiles(e.target.files)}
        className="hidden"
        accept=".csv,.xlsx,.xls"
      />

      {/* 1. 3D Glowing Cybernetic Neural Orb */}
      <div className="mb-6 transform hover:scale-105 transition-transform duration-500">
        <AIOrb size="lg" />
      </div>

      {/* 2. Hero Greeting and Subtitle */}
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

      {/* 3. Centered Large Capsule Chat Input with Dynamic Dropdown Popover */}
      <div className="w-full max-w-2xl mb-8 relative">
        {/* + Icon Menu Dropdown (Gemini / ChatGPT style) */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className={cn(
              'absolute bottom-16 left-4 z-50 w-64 rounded-2xl p-1.5 shadow-2xl border transition-all animate-in zoom-in-95 duration-150',
              isLight
                ? 'bg-white/95 backdrop-blur-xl border-slate-200 text-slate-800 shadow-slate-900/15'
                : 'bg-[#1e1e1e]/95 backdrop-blur-xl border-neutral-700 text-neutral-100 shadow-black/60'
            )}
          >
            <div className="text-[10px] font-mono font-bold px-3 py-1.5 text-slate-400 uppercase tracking-wider">
              Attach to Conversation
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer',
                isLight ? 'hover:bg-slate-100' : 'hover:bg-neutral-800'
              )}
            >
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                <Paperclip className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Upload files</div>
                <div className="text-[10px] text-slate-400 font-normal">PDF, DOCX, TXT, JSON</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer',
                isLight ? 'hover:bg-slate-100' : 'hover:bg-neutral-800'
              )}
            >
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Attach photos</div>
                <div className="text-[10px] text-slate-400 font-normal">PNG, JPG, WebP, SVG</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => csvInputRef.current?.click()}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer',
                isLight ? 'hover:bg-slate-100' : 'hover:bg-neutral-800'
              )}
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Upload CSV / Roster</div>
                <div className="text-[10px] text-slate-400 font-normal">Bulk Employee Intake</div>
              </div>
            </button>
          </div>
        )}

        {/* Attached Files Chips Bar */}
        {attachedFiles.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap px-3 mb-2">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className={cn(
                  'flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-2xl border text-xs font-medium shadow-xs animate-in fade-in zoom-in-95 duration-150',
                  isLight
                    ? 'bg-white border-blue-200/90 text-slate-800 shadow-blue-500/5'
                    : 'bg-[#262626] border-neutral-700 text-neutral-200 shadow-black/20'
                )}
              >
                {getFileIcon(file.name, file.type)}
                <span className="font-semibold max-w-[140px] truncate">{file.name}</span>
                <span className="text-[10px] font-mono text-slate-400">({formatFileSize(file.size)})</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(file.id)}
                  className={cn(
                    'p-1 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer',
                    isLight ? 'text-slate-400 hover:text-slate-700' : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
                  )}
                  title="Remove file"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

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
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                  'p-1.5 rounded-full transition-colors cursor-pointer',
                  isMenuOpen
                    ? isLight
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-neutral-800 text-white'
                    : isLight
                      ? 'hover:text-blue-600 hover:bg-blue-50'
                      : 'hover:text-white hover:bg-slate-800/80'
                )}
                title="Add attachment (Upload files, Attach photos, CSV)"
              >
                <Plus className={cn('w-4 h-4 transition-transform duration-150', isMenuOpen && 'rotate-45')} />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
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
                onClick={() => onSendMessage(suggestions[0]?.query || 'Generate a weekly onboarding summary for the HR team.')}
                className={cn(
                  'p-1.5 rounded-full transition-colors cursor-pointer',
                  isLight ? 'hover:text-blue-600 hover:bg-blue-50' : 'hover:text-cyan-300 hover:bg-slate-800/80'
                )}
                title="Reasoning templates"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

            {/* Central Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                attachedFiles.length > 0
                  ? 'Add instructions for attached file(s)...'
                  : 'Ask anything about onboarding or add files via + icon...'
              }
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
                disabled={!inputText.trim() && attachedFiles.length === 0}
                className={cn(
                  'p-2 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer',
                  (inputText.trim() || attachedFiles.length > 0)
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
                ? 'bg-white border-slate-200/80 hover:border-blue-400 shadow-xs hover:shadow-md'
                : 'bg-[#171717] border-neutral-800 hover:border-neutral-700 hover:bg-[#212121]'
            )}
          >
            <div
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors',
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#212121] border-neutral-700'
              )}
            >
              {renderIcon(card.iconType)}
            </div>
            <div className="min-w-0 flex-1">
              <h4
                className={cn(
                  'text-xs font-semibold leading-snug line-clamp-2',
                  isLight ? 'text-slate-800 group-hover:text-blue-600' : 'text-neutral-200 group-hover:text-white'
                )}
              >
                {card.title}
              </h4>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AIEmptyState;
