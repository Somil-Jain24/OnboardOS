import React, { useState, useRef, useEffect } from 'react';
import { useAIMode } from './AIModeContext';
import {
  Plus,
  Sparkles,
  Paperclip,
  Mic,
  Send,
  X,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  File,
  UploadCloud,
  Layers,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  textContent?: string;
}

interface AIComposerProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const AIComposer: React.FC<AIComposerProps> = ({ onSendMessage, disabled = false }) => {
  const { theme } = useAIMode();
  const isLight = theme === 'light';

  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

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
    if ((!text.trim() && attachedFiles.length === 0) || disabled) return;

    let finalMessage = text.trim();
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
    setText('');
    setAttachedFiles([]);
    setIsMenuOpen(false);
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

      <div className="max-w-3xl mx-auto space-y-2 relative">
        {/* + Icon Menu Dropdown (Gemini / ChatGPT style) */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className={cn(
              'absolute bottom-16 left-2 z-50 w-64 rounded-2xl p-1.5 shadow-2xl border transition-all animate-in zoom-in-95 duration-150',
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
          <div className="flex items-center gap-2 flex-wrap px-2">
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

        {/* Composer Input Box */}
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
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                'p-1.5 rounded-full transition-colors cursor-pointer',
                isMenuOpen
                  ? isLight
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-neutral-800 text-white'
                  : isLight
                    ? 'hover:text-blue-600 hover:bg-blue-50'
                    : 'hover:text-white hover:bg-neutral-800'
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
                isLight ? 'hover:text-slate-700 hover:bg-slate-100' : 'hover:text-white hover:bg-neutral-800'
              )}
              title="Attach files"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setText((prev) => (prev ? `${prev}\n` : 'Generate a weekly onboarding summary for the HR team.'))}
              className={cn(
                'p-1.5 rounded-full transition-colors cursor-pointer',
                isLight ? 'hover:text-blue-600 hover:bg-blue-50' : 'hover:text-cyan-300 hover:bg-neutral-800'
              )}
              title="Reasoning templates"
            >
              <Sparkles className="w-4 h-4" />
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
            placeholder={
              attachedFiles.length > 0
                ? 'Add instructions for the attached file(s)...'
                : 'Ask anything about onboarding or add files via + icon...'
            }
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
              disabled={(!text.trim() && attachedFiles.length === 0) || disabled}
              className={cn(
                'p-2 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer',
                (text.trim() || attachedFiles.length > 0) && !disabled
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
          Press <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 font-semibold">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 font-semibold">Shift + Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
};

export default AIComposer;
